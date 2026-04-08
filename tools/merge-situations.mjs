import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

function isPlainObject(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

async function readJson(filePath) {
  const raw = await readFile(filePath, "utf8");
  try {
    return JSON.parse(raw);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to parse JSON: ${filePath}\n${msg}`);
  }
}

async function readJsonIfExists(filePath) {
  try {
    return await readJson(filePath);
  } catch (err) {
    // If the file doesn't exist, treat as empty object.
    if (err && typeof err === "object" && "code" in err && err.code === "ENOENT") {
      return {};
    }
    throw err;
  }
}

function sortedObjectByKeys(obj) {
  const out = {};
  for (const key of Object.keys(obj).sort()) out[key] = obj[key];
  return out;
}

function stableJson(obj) {
  return `${JSON.stringify(obj, null, 2)}\n`;
}

function normalizeNewSituation({ key, value, nowIso, sourceLabel, conflicts }) {
  if (!isPlainObject(value)) {
    conflicts.push({ id: key, source: sourceLabel, reason: "not_an_object" });
    return null;
  }

  // Do not mutate caller object.
  const entry = { ...value };

  if (entry.id == null) {
    entry.id = key;
  } else if (entry.id !== key) {
    conflicts.push({
      id: key,
      source: sourceLabel,
      reason: "id_mismatch",
      details: { key, entryId: entry.id },
    });
    return null;
  }

  if (!isPlainObject(entry.scripts)) {
    conflicts.push({ id: key, source: sourceLabel, reason: "missing_scripts" });
    return null;
  }

  const requiredModes = ["gentle", "balanced", "tough"];
  for (const mode of requiredModes) {
    if (!isPlainObject(entry.scripts[mode])) {
      conflicts.push({
        id: key,
        source: sourceLabel,
        reason: "missing_script_mode",
        details: { mode },
      });
      return null;
    }
  }

  if (!entry.createdAt) entry.createdAt = nowIso;
  if (!entry.updatedAt) entry.updatedAt = nowIso;

  return entry;
}

function mergeWithoutOverwrite({
  target,
  additions,
  sourceLabel,
  conflicts,
  added,
  recordDuplicates = true,
}) {
  for (const [id, value] of Object.entries(additions)) {
    if (Object.prototype.hasOwnProperty.call(target, id)) {
      if (recordDuplicates) {
        conflicts.push({ id, source: sourceLabel, reason: "duplicate_id_existing_target" });
      }
      continue;
    }
    target[id] = value;
    added.push(id);
  }
}

function compareSharedIds(primary, fallback) {
  const divergent = [];
  for (const id of Object.keys(primary)) {
    if (!Object.prototype.hasOwnProperty.call(fallback, id)) continue;
    const a = primary[id];
    const b = fallback[id];
    // We compare by JSON string for determinism; if key order differs inside, it may show as divergent.
    // That's okay: we want to surface any potential drift to the user.
    const as = JSON.stringify(a);
    const bs = JSON.stringify(b);
    if (as !== bs) divergent.push(id);
  }
  return divergent.sort();
}

async function main() {
  const repoRoot = process.cwd();

  const primaryPath = path.join(repoRoot, "situations-extended.json");
  const fallbackPath = path.join(repoRoot, "backend", "data", "situations.json");

  const situationBatchPaths = [
    { label: "leo-situations-batch1", file: path.join(repoRoot, "temp", "leo-situations-batch1.json") },
    { label: "leo-situations-batch2", file: path.join(repoRoot, "temp", "leo-situations-batch2.json") },
    { label: "emma-situations-batch3", file: path.join(repoRoot, "temp", "emma-situations-batch3.json") },
  ];

  const consequenceBatchPath = path.join(repoRoot, "temp", "consequence-library-batch4.json");
  const consequenceOutPath = path.join(repoRoot, "backend", "data", "consequence-library.json");

  const args = new Set(process.argv.slice(2));
  const dryRun = args.has("--dry-run");

  const nowIso = new Date().toISOString();

  const primary = await readJson(primaryPath);
  const fallback = await readJson(fallbackPath);

  if (!isPlainObject(primary)) throw new Error(`Primary DB must be an object keyed by situation id: ${primaryPath}`);
  if (!isPlainObject(fallback)) throw new Error(`Fallback DB must be an object keyed by situation id: ${fallbackPath}`);

  const conflicts = [];
  const addedPrimary = [];
  const addedFallback = [];

  // Step 1: sync missing existing entries between DBs (add-only, no overwrites).
  mergeWithoutOverwrite({
    target: primary,
    additions: fallback,
    sourceLabel: "sync_from_fallback",
    conflicts,
    added: addedPrimary,
    recordDuplicates: false,
  });
  mergeWithoutOverwrite({
    target: fallback,
    additions: primary,
    sourceLabel: "sync_from_primary",
    conflicts,
    added: addedFallback,
    recordDuplicates: false,
  });

  // Step 2: merge in all batch situations (normalized only for new entries).
  for (const batch of situationBatchPaths) {
    const batchObj = await readJson(batch.file);
    if (!isPlainObject(batchObj)) {
      conflicts.push({ id: "(batch)", source: batch.label, reason: "batch_not_object" });
      continue;
    }

    const normalizedAdditions = {};
    for (const [key, value] of Object.entries(batchObj)) {
      const normalized = normalizeNewSituation({
        key,
        value,
        nowIso,
        sourceLabel: batch.label,
        conflicts,
      });
      if (normalized) normalizedAdditions[key] = normalized;
    }

    mergeWithoutOverwrite({
      target: primary,
      additions: normalizedAdditions,
      sourceLabel: batch.label,
      conflicts,
      added: addedPrimary,
    });
    mergeWithoutOverwrite({
      target: fallback,
      additions: normalizedAdditions,
      sourceLabel: batch.label,
      conflicts,
      added: addedFallback,
    });
  }

  // Step 3: ensure both DBs have identical ID sets (add-only).
  mergeWithoutOverwrite({
    target: primary,
    additions: fallback,
    sourceLabel: "final_sync_from_fallback",
    conflicts,
    added: addedPrimary,
    recordDuplicates: false,
  });
  mergeWithoutOverwrite({
    target: fallback,
    additions: primary,
    sourceLabel: "final_sync_from_primary",
    conflicts,
    added: addedFallback,
    recordDuplicates: false,
  });

  const primarySorted = sortedObjectByKeys(primary);
  const fallbackSorted = sortedObjectByKeys(fallback);

  // Step 4: consequence library write/merge (add-only).
  const consequenceBatch = await readJson(consequenceBatchPath);
  if (!isPlainObject(consequenceBatch)) {
    conflicts.push({ id: "(consequence)", source: "consequence-library-batch4", reason: "batch_not_object" });
  } else {
    const existingConsequence = await readJsonIfExists(consequenceOutPath);
    if (!isPlainObject(existingConsequence)) {
      conflicts.push({
        id: "(consequence)",
        source: "consequence-library",
        reason: "existing_file_not_object",
      });
    } else {
      const out = { ...existingConsequence };
      const consequenceAdded = [];
      for (const [k, v] of Object.entries(consequenceBatch)) {
        if (Object.prototype.hasOwnProperty.call(out, k)) {
          conflicts.push({ id: k, source: "consequence-library-batch4", reason: "duplicate_key_existing_target" });
          continue;
        }
        out[k] = v;
        consequenceAdded.push(k);
      }

      const outSorted = sortedObjectByKeys(out);
      if (!dryRun) {
        await writeFile(consequenceOutPath, stableJson(outSorted), "utf8");
      }
      console.log(`Consequence library: ${dryRun ? "DRY RUN, no write" : "written"} -> ${consequenceOutPath}`);
      console.log(`Consequence library keys added: ${consequenceAdded.length}`);
      if (consequenceAdded.length) console.log(consequenceAdded.sort().join("\n"));
    }
  }

  const primaryIds = Object.keys(primarySorted);
  const fallbackIds = Object.keys(fallbackSorted);

  const idSetMismatch =
    primaryIds.length !== fallbackIds.length ||
    primaryIds.some((id, idx) => id !== fallbackIds[idx]);

  const divergentSharedIds = compareSharedIds(primarySorted, fallbackSorted);

  if (!dryRun) {
    await writeFile(primaryPath, stableJson(primarySorted), "utf8");
    await writeFile(fallbackPath, stableJson(fallbackSorted), "utf8");
  }

  console.log("");
  console.log("=== Situations merge report ===");
  console.log(`Primary:   ${dryRun ? "DRY RUN, no write" : "written"} -> ${primaryPath}`);
  console.log(`Fallback:  ${dryRun ? "DRY RUN, no write" : "written"} -> ${fallbackPath}`);
  console.log(`Primary total situations:  ${primaryIds.length}`);
  console.log(`Fallback total situations: ${fallbackIds.length}`);
  console.log(`ID sets match: ${idSetMismatch ? "NO" : "YES"}`);
  console.log(`Divergent shared IDs (content differs, not overwritten): ${divergentSharedIds.length}`);
  if (divergentSharedIds.length) console.log(divergentSharedIds.join("\n"));

  console.log("");
  console.log(`Added to primary (non-overwrite): ${addedPrimary.length}`);
  console.log(`Added to fallback (non-overwrite): ${addedFallback.length}`);

  console.log("");
  console.log("All situation IDs (sorted):");
  console.log(primaryIds.join("\n"));

  console.log("");
  console.log(`Conflicts/duplicates flagged: ${conflicts.length}`);
  if (conflicts.length) {
    console.log(JSON.stringify(conflicts, null, 2));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

