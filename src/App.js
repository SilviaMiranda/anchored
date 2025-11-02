import React, { useState, useEffect } from 'react';
import { Home, Calendar as CalendarIcon, BookOpen, Settings, Sun, Clock, Zap, Users, User, AlertTriangle, XCircle, MessageCircle, Monitor, Database, GraduationCap } from 'lucide-react';
import ApiService from './services/api';
import SituationManager from './components/SituationManager';
import LearningModules from './components/LearningModules';
import RoutinesHome from './components/RoutinesHome';
import TodayView from './components/TodayView';
import FullWeekView from './components/FullWeekView';
import TemplateSelection from './components/TemplateSelection';
import HardWeekPlanner from './components/HardWeekPlanner';
import KidFriendlyView from './components/KidFriendlyView';
import CustodySettings from './components/CustodySettings';

// Situation Scripts Database (fallback data)
const FALLBACK_SCRIPTS = {
  'homework': {
    title: 'Homework Battle',
    scripts: {
      gentle: {
        say: "I know homework feels really hard right now. Your brain is tired from school. Let's figure out together how to make this feel manageable.",
        do: "Sit with him. Break it into tiny chunks - maybe just 5 minutes to start. Offer sensory break first (jump, push wall, snack). Use a timer he can see. Celebrate any effort.",
        dont: ["Battle for hours", "Do the work for him", "Threaten or guilt trip"],
        why: "His ADHD brain is genuinely depleted after school. Collaboration reduces power struggle and helps him feel supported rather than pressured."
      },
      balanced: {
        say: "Homework is part of school. It's hard, but it has to get done. Let's make a plan together.",
        do: "Set timer for 15 minutes. He tries his best. Break after. Second 15-minute session. If genuine effort made, he earns 30 min screen time. If refused, outdoor play instead.",
        dont: ["Battle for hours", "Do it for him", "Skip consequences"],
        why: "Clear structure with built-in breaks works with ADHD. Natural consequences teach responsibility while accommodating his needs."
      },
      tough: {
        say: "You have homework. It's not optional. You can choose to do it now and earn screens, or refuse and lose them. Your choice.",
        do: "One warning with clear consequence. Set timer. If genuine refusal after warning: No screens today, homework must be done before breakfast tomorrow. Follow through even if he melts down.",
        dont: ["Give multiple chances", "Cave when he escalates", "Make empty threats"],
        why: "Consistency teaches accountability. His ADHD means he needs clear boundaries even more, not fewer. Following through builds trust.",
        tough: "You're tired and want to let it slide. Don't. If he doesn't try today, he does it tomorrow morning before fun stuff."
      }
    }
  },
  'screen': {
    title: 'Screen Refusal',
    scripts: {
      gentle: {
        say: "I know it's so hard to stop when you're having fun. Your brain wants to keep going. Let's help your brain make the switch.",
        do: "Give a 5-minute warning with timer. When it goes off: 'Timer's done. I'm going to count to 10 while you finish up.' Count slowly. If still playing at 10, calmly take device. Offer replacement activity.",
        dont: ["Negotiate endlessly", "Get angry", "Shame him for struggling"],
        why: "Transitions are genuinely hard for ADHD brains. Warning + countdown + calm follow-through respects his neurology while maintaining boundary."
      },
      balanced: {
        say: "Timer's up. Screens off now. You can turn it off, or I do it and you lose 30 minutes tomorrow. Counting to 5.",
        do: "Count slowly to 5. If no action, remove device. He loses 30 minutes tomorrow. Stay calm but firm. Natural consequence teaches the rule.",
        dont: ["Give multiple warnings", "Negotiate 'just 5 more minutes'", "Cave when he escalates"],
        why: "Clear countdown respects his transition time. Consistent consequence teaches that the rule is real, reducing future battles."
      },
      tough: {
        say: "Screens off. Now. This is not a negotiation.",
        do: "No countdown needed - you already gave warning. Remove device immediately. No screens rest of day. Tomorrow he can try again. Don't engage in argument.",
        dont: ["Explain again (he knows)", "Feel guilty", "Give it back when he calms down"],
        why: "Sometimes you need to just act. The repeated battles happen because consequences haven't been consistent. Time to break that pattern.",
        tough: "You already gave a warning. Now it's action time. Remove the device. Don't explain again - he knows the rule."
      }
    }
  },
  'leo-hit': {
    title: 'Leo Hit Emma',
    scripts: {
      gentle: {
        say: "Your body used hands for hurting. That's not okay. Hands are for helping. I need you to go to your room so everyone can be safe.",
        do: "Immediate separation - his room for 15 minutes. After he's calm, help him process what happened. Practice what he could do instead. Apologize to Emma when ready. Loss of preferred activity for today.",
        dont: ["Skip consequence because 'he's impulsive'", "Lecture when he's dysregulated", "Force immediate apology"],
        why: "Separation keeps everyone safe. Processing after he's calm teaches alternatives. Natural consequence reinforces the boundary while acknowledging his developmental stage."
      },
      balanced: {
        say: "You hurt Emma with your hands. Hands are for helping, not hurting. Room. Now. 15 minutes.",
        do: "Immediate separation. Loss of 1 hour screen time today. After calm: apologize with action (draw picture, help with something). Practice alternatives: 'When angry, I can stomp, squeeze pillow, ask for help.'",
        dont: ["Skip consequence because 'impulsive'", "Let him off easy", "Make Emma comfort him"],
        why: "Immediate consequence teaches cause and effect. Action-based apology is more meaningful than words. He CAN learn control with consistent boundaries."
      },
      tough: {
        say: "You hit your sister. That's never okay. Your room. No screens today. Tomorrow we try again.",
        do: "Immediate removal to his room. Loss of all screens today. No negotiation. After he's calm, brief conversation: 'Hitting is never okay. When you're angry, what can you do instead?' Then move on.",
        dont: ["Soften the consequence", "Accept ADHD as excuse", "Engage in long discussion about fairness"],
        why: "Physical aggression needs strong, immediate boundary. His ADHD explains the impulse but doesn't excuse harm. Consistent consequences reduce future incidents.",
        tough: "Physical aggression = immediate consequence, every time. No excuses. Remove him, enforce consequence, don't soften it."
      }
    }
  },
  'leo-defiant': {
    title: 'Leo Being Defiant',
    scripts: {
      gentle: {
        say: "I can see this feels hard for you right now. I need you to [specific request]. Can you do that, or do you need help?",
        do: "Offer choice: 'You can do it yourself, or I can help you.' Give 30 seconds. If still refusing, do hand-over-hand guidance. Acknowledge when he complies. If total refusal, loss of next preferred activity.",
        dont: ["Repeat request 10 times", "Get into argument", "Give up"],
        why: "Offering help reduces power struggle. Some ADHD defiance is executive function struggle disguised as opposition. But boundary remains."
      },
      balanced: {
        say: "I asked once. I'm not asking again. Do it now, or you lose [specific thing]. Your choice.",
        do: "One warning with clear consequence. Wait 10 seconds silently. If refuses: follow through immediately on consequence. No discussion.",
        dont: ["Count to 3 repeatedly", "Make empty threats", "Argue or over-explain"],
        why: "One warning is fair. Silence removes the attention-seeking reward. Immediate follow-through teaches you mean what you say."
      },
      tough: {
        say: "[The request]. Now.",
        do: "No warnings - just expectation. If he refuses, immediate consequence. No discussion about fairness. This isn't negotiable.",
        dont: ["Explain why it's important", "Give chances", "React to his protests"],
        why: "You've been giving too many chances. His defiance is working to avoid tasks. Time to just expect compliance and enforce boundaries.",
        tough: "You're giving too many chances. One warning, then action. Stop talking and start following through."
      }
    }
  },
  'leo-meltdown': {
    title: 'Leo Having Meltdown',
    scripts: {
      gentle: {
        say: "I see your body is having big feelings. You're safe. I'm here. Let me help your body calm down.",
        do: "Keep him safe (remove dangerous objects). Lower your voice. Offer sensory options: 'Do you need to squeeze something? Jump? Push the wall?' Stay nearby but give space if he needs it. Match your breathing to calm pace.",
        dont: ["Try to reason or talk through it", "Punish the meltdown", "Touch him if he's pushing away"],
        why: "During meltdown, his thinking brain is offline. He needs co-regulation, not logic. Safety and sensory regulation help his nervous system reset."
      },
      balanced: {
        say: "Your body is having big feelings. You're safe. I'm here. Let's help your body calm down.",
        do: "Keep him safe. Offer sensory regulation options. Stay calm and nearby. Wait for the storm to pass. After he's calm (20+ min): brief discussion about what happened and what he can do next time. No punishment for the meltdown itself.",
        dont: ["Reason mid-meltdown", "Take it personally", "Punish the meltdown"],
        why: "Meltdowns are nervous system overwhelm. Punishment makes them worse. Consistent co-regulation teaches his brain to regulate faster over time."
      },
      tough: {
        say: "You're safe. I'm right here.",
        do: "Ensure safety. Sit nearby. Wait it out. DO NOT try to fix or discuss. After it's completely over and he's calm: 'That was really hard. What happened before the big feelings started?' Listen. Then move on with the day.",
        dont: ["Try to talk him down", "Make it a big deal", "Punish unless it was manipulative"],
        why: "If it's a real meltdown (not manipulation), he needs safety and waiting. Trust your gut on whether it's genuine overwhelm vs. learned behavior.",
        tough: "Meltdowns need containment, not consequences. But if he's using 'meltdowns' to manipulate, that's different. Trust your gut."
      }
    }
  },
  'emma-trigger': {
    title: 'Emma Triggering Leo',
    scripts: {
      gentle: {
        say: "Emma, I can see you know what bothers Leo. When you choose to do that, it makes things harder for everyone. What's going on?",
        do: "Listen to her perspective. Acknowledge her feelings. Set boundary: 'Even if you're frustrated, you can't deliberately upset him.' Natural consequence: Loss of next preferred activity. Help her identify what she needs instead.",
        dont: ["Blame her for his reactions", "Dismiss her feelings", "Let her off because she's 'the good one'"],
        why: "She's 12 and capable of manipulation, but she also has needs. Understanding why she's doing it helps address root cause while maintaining boundary."
      },
      balanced: {
        say: "Emma, you know exactly what triggers Leo. When you choose to do it, you're choosing the consequence. You lose [specific privilege] today.",
        do: "Use logic: 'You're 12, he's 8. When you trigger him, I deal with both of you = less time for what you want.' Loss of privilege today. Brief and done. Don't engage in debate.",
        dont: ["Accept 'but he...' excuses", "Let her play victim", "Give in to teen drama"],
        why: "She's developmentally capable of understanding cause and effect. Logical consequences that impact HER directly are more effective than lectures."
      },
      tough: {
        say: "You know better. You did it anyway. No [privilege] today. We're done discussing it.",
        do: "Immediate consequence. No discussion about fairness or what Leo did. She made a choice, there's a consequence. Walk away from attempts to argue.",
        dont: ["Engage in debate", "Let her redirect to Leo's behavior", "Soften because she seems upset"],
        why: "She's manipulating the situation and you're letting her. Clear consequence without discussion breaks the pattern. She'll learn faster.",
        tough: "She knows better. Stop letting her manipulate the situation. Clear consequence, no debate."
      }
    }
  },
  'emma-attitude': {
    title: "Emma's Teen Attitude",
    scripts: {
      gentle: {
        say: "I hear that you're frustrated. That tone isn't okay, though. Want to try again?",
        do: "Give her one chance to reset. If she takes it: engage normally. If attitude continues: 'I can see you need space. Go to your room until you're ready to speak respectfully.' Check in after 20 minutes.",
        dont: ["Take it personally", "Lecture about respect", "Engage while she's escalated"],
        why: "Teen brains are genuinely struggling with emotion regulation. One chance to reset respects her development while maintaining boundary."
      },
      balanced: {
        say: "That tone isn't okay. You can try again respectfully, or you can go to your room until you're ready.",
        do: "One chance to reset. If attitude continues: 'Room. Now.' Natural consequence: She loses access to you (and phone/computer in her room) for 30 min to 1 hour. When she emerges respectfully, move forward.",
        dont: ["Engage in argument", "Yell back", "Bring up past incidents"],
        why: "Disrespect = disconnection. She learns that attitude pushes away the connection she actually wants. Keep it simple and consistent."
      },
      tough: {
        say: "That tone stops now, or you're in your room for an hour. Choose.",
        do: "No second chance - she knows the rule. If attitude continues, point to her room. No phone, no computer. She can come out when she's ready to be respectful. Don't chase her or engage through the door.",
        dont: ["Argue through the door", "Give warnings", "Feel guilty"],
        why: "You're letting her speak to you this way too often. The pattern stops with consistent consequences. One boundary, enforced every time.",
        tough: "You're letting her speak to you this way. Stop. One warning, then action. She goes to her room."
      }
    }
  },
  'sibling-both': {
    title: 'Both Fighting',
    scripts: {
      gentle: {
        say: "Both of you are dysregulated right now. You need space from each other. Leo - your room. Emma - living room. 15 minutes.",
        do: "Separate them immediately. After 15 min, check in with each separately. Listen to both sides. Acknowledge feelings. Natural consequence for both: Next shared activity is delayed or shortened. Help them problem-solve for next time.",
        dont: ["Try to figure out who started it", "Force apologies before ready", "Skip consequences"],
        why: "When both are escalated, separation first. Processing after calms helps them learn. Shared consequence teaches they're a team, even when fighting."
      },
      balanced: {
        say: "Both of you are dysregulated. Separate rooms. Now. 15 minutes, then we talk.",
        do: "Separate them. After 15 min, talk to each separately. Natural consequence: Both lose next preferred activity (30 min screen time each). Brief explanation: 'When you both escalate, you both have consequences.'",
        dont: ["Try to figure out who started it", "Force apologies before ready", "Let it slide"],
        why: "Separation prevents escalation. Equal consequence removes the 'who started it' game. They learn they're both responsible for de-escalating."
      },
      tough: {
        say: "Separate rooms. Now. Both of you lost [specific activity] today.",
        do: "Immediate separation. Both get consequence. No discussion about who did what. Brief check-in later: 'What will you do differently next time?' Then move on.",
        dont: ["Investigate who's at fault", "Give different consequences", "Accept excuses"],
        why: "When both are screaming, both own it. Trying to assign blame wastes energy and teaches them to play victim. Consequence for both, move on.",
        tough: "When both are screaming, both get consequences. Period. Separate them, enforce consequence, move on."
      }
    }
  }
};

export default function AnchoredApp() {
  const [screen, setScreen] = useState('home');
  const [energy, setEnergy] = useState(localStorage.getItem('energy') || 'survival');
  const [style, setStyle] = useState(localStorage.getItem('style') || 'balanced');
  const [modal, setModal] = useState(null);
  const [selectedSituation, setSelectedSituation] = useState(null);
  const [situations, setSituations] = useState({});
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [currentRoutineSummary, setCurrentRoutineSummary] = useState(null);

  useEffect(() => {
    localStorage.setItem('energy', energy);
  }, [energy]);

  useEffect(() => {
    localStorage.setItem('style', style);
  }, [style]);

  // Load situations from API
  useEffect(() => {
    const loadSituations = async () => {
      try {
        setLoading(true);
        const data = await ApiService.getSituations();
        setSituations(data);
        setApiError(null);
      } catch (error) {
        console.error('Failed to load situations from API:', error);
        setApiError('Failed to load situations. Using offline data.');
        setSituations(FALLBACK_SCRIPTS);
      } finally {
        setLoading(false);
      }
    };

    loadSituations();
  }, []);

  // Load current routine summary for Home card
  useEffect(() => {
    const loadRoutine = async () => {
      try {
        const data = await ApiService.getCurrentRoutine();
        setCurrentRoutineSummary({ mode: data.mode, weekStartDate: data.weekStartDate });
      } catch (e) {
        setCurrentRoutineSummary(null);
      }
    };
    loadRoutine();
  }, []);

  // Helper function to get Monday of a week
  const getMonday = (date = new Date()) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = (day + 6) % 7;
    d.setDate(d.getDate() - diff);
    return d;
  };

  // Get custody info
  const getCustodyInfo = () => {
    try {
      const custodySettings = JSON.parse(localStorage.getItem('custodySettings') || '{}');
      
      if (!custodySettings.custodyType || custodySettings.custodyType === 'no') {
        return { hasKids: true, display: '👨‍👩‍👧‍👦 Kids with you' };
      }
      
      if (custodySettings.custodyType === 'alternating') {
        const today = new Date();
        const referenceWeekStart = new Date(custodySettings.weekStartDate);
        
        // Get current week's Monday
        const currentWeekMonday = getMonday(today);
        
        // Calculate weeks difference
        const msPerWeek = 7 * 24 * 60 * 60 * 1000;
        const weeksDiff = Math.floor((currentWeekMonday - referenceWeekStart) / msPerWeek);
        
        // If currentWeekHasKids is true for week 0, then even weeks have kids
        const hasKids = custodySettings.currentWeekHasKids ? 
          (weeksDiff % 2 === 0) : 
          (weeksDiff % 2 === 1);
        
        return { 
          hasKids: hasKids, 
          display: hasKids ? '👨‍👩‍👧‍👦 Kids with you this week' : '🏠 Kids at dad\'s this week'
        };
      }
      
      return { hasKids: true, display: '👨‍👩‍👧‍👦 Kids with you' };
    } catch (e) {
      return { hasKids: true, display: '👨‍👩‍👧‍👦 Kids with you' };
    }
  };

  const switchRoutineMode = async (newMode) => {
    try {
      if (!currentRoutineSummary?.weekStartDate) return;
      await ApiService.updateRoutine(currentRoutineSummary.weekStartDate, { mode: newMode });
      setCurrentRoutineSummary({ ...currentRoutineSummary, mode: newMode });
      alert(`✓ Routine switched to ${newMode.toUpperCase()} mode`);
    } catch (e) {
      console.error('Failed to switch routine mode', e);
      alert('Failed to switch routine mode');
    }
  };

  const refreshSituations = async () => {
    try {
      const data = await ApiService.getSituations();
      setSituations(data);
      setApiError(null);
    } catch (error) {
      console.error('Failed to refresh situations:', error);
      setApiError('Failed to refresh situations.');
    }
  };

  const showSituation = (situationKey) => {
    setSelectedSituation(situationKey);
    setModal('response');
  };

  const getCurrentScripts = () => {
    // Always merge API data with fallback - fallback has all situations
    const merged = { ...FALLBACK_SCRIPTS, ...situations };
    return merged;
  };

  const closeModal = () => {
    setModal(null);
    setSelectedSituation(null);
  };

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: 'white',
      minHeight: '100vh',
      color: '#2D3748'
    }}>
      <div style={{
        maxWidth: '450px',
        margin: '0 auto',
        background: 'white',
        minHeight: '100vh',
        position: 'relative',
        paddingTop: '0',
        paddingBottom: '80px',
        boxShadow: '0 0 40px rgba(0, 0, 0, 0.06)'
      }}>
        {/* Header - Minimal sticky top bar with subtle gradient
            Designed to maximize content space while maintaining brand identity.
            Settings button removed from header (accessible via bottom navigation for better thumb reach).
        */}
        <div style={{
          // Subtle 8% opacity gradient across app's color palette for visual interest without distraction
          background: 'linear-gradient(90deg, rgba(255,107,107,0.08) 0%, rgba(255,217,61,0.08) 20%, rgba(107,203,119,0.08) 40%, rgba(77,150,255,0.08) 60%, rgba(157,78,221,0.08) 80%, rgba(255,107,203,0.08) 100%)',
          backdropFilter: 'blur(10px)', // Glass morphism effect
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          borderBottom: '1px solid rgba(157,78,221,0.15)', // Purple-tinted border for brand consistency
          boxShadow: '0 2px 8px rgba(157, 78, 221, 0.1)', // Subtle purple shadow
          position: 'sticky', // Stays at top when scrolling
          top: 0,
          zIndex: 100
        }}>
          {/* API Error Banner - Shows when backend connection fails */}
          {apiError && (
            <div style={{
              position: 'absolute',
              top: '10px',
              right: '20px',
              background: 'rgba(255, 107, 107, 0.9)',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '0.8em',
              zIndex: 10
            }}>
              ⚠️ {apiError}
            </div>
          )}
          {/* Logo - Circular with subtle shadow */}
          <img 
            src="/anchored-logo.png" 
            alt="Anchored" 
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}
          />
          {/* App Name - Bold, spaced lettering for brand recognition */}
          <div style={{
            fontSize: '1.3em',
            fontWeight: 600,
            letterSpacing: '3px',
            color: '#2D3748'
          }}>
            ANCHORED
          </div>
        </div>

        {/* Home Screen */}
        {screen === 'home' && (
          <div style={{ padding: '24px 20px' }}>
            {/* This Week's Mode */}
            <div style={{
              background: 'white',
              border: '1px solid #E5E5E5',
              borderRadius: '20px',
              padding: '20px',
              marginBottom: '24px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
            }}>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '0.75em', letterSpacing: '1px', color: '#718096', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>
                  THIS WEEK'S MODE
                </div>
                <div style={{ fontWeight: 700, fontSize: '1.05em', color: '#2D3748', marginBottom: '8px' }}>
                  {currentRoutineSummary?.mode ? (
                    <>
                      {currentRoutineSummary.mode === 'regular' && '🟢 Regular'}
                      {currentRoutineSummary.mode === 'hard' && '🟡 Hard'}
                      {currentRoutineSummary.mode === 'hardest' && '🔴 Hardest'}
                    </>
                  ) : 'No routine set'}
                </div>
                
                {/* Custody Info */}
                <div style={{ color: '#6B7280', fontSize: '0.9em', fontWeight: 500 }}>
                  {getCustodyInfo().display}
                </div>
              </div>
              <button onClick={() => setScreen('routines')} style={{
                width: '100%',
                padding: '10px 14px',
                background: 'linear-gradient(135deg, #9D4EDD 0%, #FF6BCB 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}>
                View Weekly Routine
              </button>
            </div>
            {loading && (
              <div style={{
                textAlign: 'center',
                padding: '40px',
                color: '#9A938E'
              }}>
                Loading situations...
              </div>
            )}
            {/* Energy Section */}
            <div style={{
              background: '#FAFAFA',
              borderRadius: '24px',
              padding: '24px 20px',
              marginBottom: '24px',
              border: '1px solid #E5E5E5',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
            }}>
              <div style={{
                fontSize: '0.75em',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                color: '#718096',
                marginBottom: '16px',
                textAlign: 'center',
                fontWeight: 700
              }}>MY ENERGY</div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px'
              }}>
                {[
                  { key: 'full', icon: Sun, label: 'Full\nPower' },
                  { key: 'running', icon: Clock, label: 'Running\nLow' },
                  { key: 'survival', icon: Zap, label: 'Survival\nMode' }
                ].map(({ key, icon: Icon, label }) => (
                  <button
                    key={key}
                    onClick={() => setEnergy(key)}
                    style={{
                      padding: '18px 8px',
                      borderRadius: '16px',
                      border: energy === key ? '3px solid transparent' : '2px solid #E5E5E5',
                      background: energy === key ? 
                        'linear-gradient(white, white) padding-box, linear-gradient(135deg, #FF6B6B, #FFD93D, #6BCB77, #4D96FF, #9D4EDD, #FF6BCB) border-box' : 
                        'white',
                      fontSize: '0.8em',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'center',
                      color: '#2D3748',
                      boxShadow: energy === key ? '0 4px 12px rgba(157, 78, 221, 0.2)' : '0 1px 3px rgba(0, 0, 0, 0.05)',
                      transform: energy === key ? 'translateY(-2px)' : 'none',
                      transition: 'all 0.3s ease',
                      whiteSpace: 'pre-line'
                    }}
                  >
                    <Icon size={32} strokeWidth={2} style={{ margin: '0 auto 8px', display: 'block' }} />
                    {label}
                  </button>
                ))}
              </div>
              <div style={{
                textAlign: 'center',
                color: '#718096',
                fontSize: '0.85em',
                marginTop: '8px'
              }}>
                How you're doing today
              </div>
            </div>

            {/* Main Button */}
            <button
              onClick={() => setModal('crisis')}
              style={{
                background: 'linear-gradient(135deg, #9D4EDD 0%, #FF6BCB 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '28px',
                padding: '48px 32px',
                width: '100%',
                fontSize: '1.5em',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(157, 78, 221, 0.3)',
                marginBottom: '28px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{
                width: '56px',
                height: '56px',
                margin: '0 auto 16px',
                background: 'rgba(255, 255, 255, 0.25)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="32" height="32" viewBox="0 0 100 100">
                  <circle cx="50" cy="20" r="8" fill="white" />
                  <path d="M50 28 L50 80" stroke="white" strokeWidth="6" fill="none" />
                  <path d="M30 60 L50 75 L70 60" stroke="white" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M30 70 C30 65, 35 60, 50 60 C65 60, 70 65, 70 70" stroke="white" strokeWidth="5" fill="none" strokeLinecap="round" />
                </svg>
              </div>
              What do I need right now?
              <div style={{
                fontSize: '0.45em',
                marginTop: '10px',
                opacity: 0.9,
                fontWeight: 400
              }}>Ground, Regulate, Respond</div>
            </button>

            {/* Quick Solutions */}
            <div style={{ marginBottom: '28px' }}>
              <div style={{
                fontSize: '0.75em',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                color: '#6B6560',
                marginBottom: '16px',
                textAlign: 'center',
                fontWeight: 600
              }}>QUICK SOLUTIONS</div>
              <div style={{
                display: 'flex',
                gap: '12px',
                overflowX: 'auto',
                padding: '4px 0 12px'
              }}>
                {[
                  { key: 'homework', icon: BookOpen, label: 'Homework\nBattle' },
                  { key: 'screen', icon: Monitor, label: 'Screen\nRefusal' }
                ].map(({ key, icon: Icon, label }) => (
                  <div
                    key={key}
                    onClick={() => showSituation(key)}
                    style={{
                      minWidth: '160px',
                      background: 'white',
                      border: '1px solid #E5E5E5',
                      borderRadius: '18px',
                      padding: '24px 20px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      fontWeight: 600,
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                      whiteSpace: 'pre-line'
                    }}
                  >
                    <div style={{
                      width: '52px',
                      height: '52px',
                      margin: '0 auto 12px',
                      background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.15), rgba(77, 150, 255, 0.15))',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Icon size={28} strokeWidth={2} color="#9D4EDD" />
                    </div>
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* Homework Guide */}
            <div
              onClick={() => setModal('homework')}
              style={{
                background: 'white',
                border: '1px solid #E5E5E5',
                borderRadius: '20px',
                padding: '24px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
              }}
            >
              <div style={{
                width: '44px',
                height: '44px',
                marginBottom: '12px',
                background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.2), rgba(107, 203, 119, 0.2))',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <BookOpen size={24} strokeWidth={2} color="#4D96FF" />
              </div>
              <h3 style={{ color: '#4D96FF', fontSize: '1.1em', marginBottom: '8px', fontWeight: 600 }}>
                Homework Guide
              </h3>
              <p style={{ color: '#9A938E', fontSize: '0.9em' }}>
                After-school routines that work
              </p>
            </div>
          </div>
        )}

        {/* Settings Screen */}
        {screen === 'settings' && (
          <div style={{ padding: '24px 20px' }}>
            <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#2D3748', fontWeight: 700, fontSize: '24px' }}>Settings</h2>
            
            {/* Custody Schedule Button */}
            <button
              onClick={() => setScreen('custody-settings')}
              style={{
                width: '100%',
                padding: '20px',
                background: 'white',
                border: '1px solid #E5E5E5',
                borderRadius: '16px',
                cursor: 'pointer',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
              }}
            >
              <div style={{
                fontSize: '32px',
                lineHeight: 1
              }}>
                👨‍👩‍👧‍👦
              </div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontWeight: 600, color: '#2D3748', marginBottom: '4px' }}>
                  Custody Schedule
                </div>
                <div style={{ fontSize: '0.9em', color: '#9A938E' }}>
                  Set when kids are with you
                </div>
              </div>
              <div style={{ color: '#9A938E', fontSize: '1.5em' }}>›</div>
            </button>

            <button
              onClick={() => setScreen('manage')}
              style={{
                width: '100%',
                padding: '16px',
                background: 'linear-gradient(135deg, #4D96FF 0%, #6BCB77 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '14px',
                fontSize: '1em',
                fontWeight: 600,
                cursor: 'pointer',
                marginBottom: '20px',
                boxShadow: '0 6px 20px rgba(77, 150, 255, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Database size={20} />
              Manage Situations
            </button>
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '28px 24px',
              marginBottom: '20px',
              border: '1px solid #E5E5E5',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
            }}>
              <h2 style={{ color: '#9D4EDD', marginBottom: '20px', fontSize: '1.2em', fontWeight: 600 }}>
                Response Style
              </h2>
              
              {[
                { key: 'gentle', emoji: '🤲', title: 'Gentle & Supportive', desc: 'Warm, understanding, collaborative' },
                { key: 'balanced', emoji: '⚖️', title: 'Balanced', desc: 'Kind but firm, clear direction' },
                { key: 'tough', emoji: '🔥', title: 'Tough Love', desc: 'Direct, accountability-focused' }
              ].map(({ key, emoji, title, desc }) => (
                <label
                  key={key}
                  onClick={() => setStyle(key)}
                  style={{
                    display: 'flex',
                    alignItems: 'start',
                    gap: '12px',
                    padding: '16px',
                    background: style === key ? 'white' : '#FAFAFA',
                    borderRadius: '14px',
                    cursor: 'pointer',
                    border: style === key ? '3px solid transparent' : '2px solid #E5E5E5',
                    backgroundImage: style === key ? 
                      'linear-gradient(white, white), linear-gradient(135deg, #FF6B6B, #FFD93D, #6BCB77, #4D96FF, #9D4EDD, #FF6BCB)' : 
                      'none',
                    backgroundOrigin: style === key ? 'border-box' : 'initial',
                    backgroundClip: style === key ? 'padding-box, border-box' : 'initial',
                    marginBottom: '12px'
                  }}
                >
                  <input
                    type="radio"
                    checked={style === key}
                    onChange={() => setStyle(key)}
                    style={{ marginTop: '3px', width: '20px', height: '20px' }}
                  />
                  <div>
                    <strong style={{ display: 'block', marginBottom: '4px' }}>
                      {emoji} {title}
                    </strong>
                    <small style={{ color: '#9A938E' }}>{desc}</small>
                  </div>
                </label>
              ))}

              <div style={{
                background: '#F7FAFC',
                borderRadius: '12px',
                padding: '16px',
                marginTop: '20px',
                fontSize: '0.85em',
                lineHeight: 1.6,
                color: '#4A5568'
              }}>
                <strong style={{ display: 'block', color: '#4D96FF', marginBottom: '8px' }}>
                  💡 When to use each style:
                </strong>
                <p><strong>Gentle:</strong> When you need support and encouragement, not pressure. Best for exhausting days.</p>
                <p><strong>Balanced:</strong> Default mode. Clear boundaries with warmth. Best for most situations.</p>
                <p><strong>Tough Love:</strong> When you need a firm push to follow through. Best when you're avoiding consequences.</p>
              </div>

              <button
                onClick={() => {
                  setScreen('home');
                  alert('✓ Settings saved!');
                }}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: 'linear-gradient(135deg, #9D4EDD 0%, #FF6BCB 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '14px',
                  fontSize: '1em',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginTop: '20px',
                  boxShadow: '0 6px 20px rgba(157, 78, 221, 0.4)'
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* Learn Screen */}
        {screen === 'learn' && (
          <LearningModules />
        )}

        {/* Manage Screen */}
        {screen === 'manage' && (
          <SituationManager 
            situations={getCurrentScripts()} 
            onRefresh={refreshSituations}
          />
        )}

        {/* Routines Screens - Use NEW Simplified Components */}
        {screen === 'routines' && (
          <RoutinesHome onNavigate={(to) => setScreen(to)} />
        )}

        {screen === 'routines-today' && (
          <TodayView 
            onBack={() => setScreen('routines')}
          />
        )}

        {screen === 'routines-week' && (
          <FullWeekView 
            onBack={() => setScreen('routines')} 
            onOpenDay={() => {
              setScreen('routines-today');
            }}
          />
        )}

        {screen === 'routines-templates' && (
          <TemplateSelection 
            onBack={() => setScreen('routines')} 
            onStarted={async () => {
              // Refresh routine data
              try {
                const data = await ApiService.getCurrentRoutine();
                setCurrentRoutineSummary({ mode: data.mode, weekStartDate: data.weekStartDate });
              } catch (e) {
                setCurrentRoutineSummary(null);
              }
              setScreen('routines');
            }}
          />
        )}

        {screen === 'routines-upcoming' && (
          <div style={{ padding: '24px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h2 style={{ margin: 0, color: '#9D4EDD' }}>Upcoming Weeks</h2>
              <button onClick={() => setScreen('routines')} style={{ padding: '8px 12px', border: '1px solid #E5E5E5', borderRadius: '10px', background: 'white', fontWeight: 600 }}>Back</button>
            </div>
            <HardWeekPlanner />
          </div>
        )}

        {screen === 'routines-kids' && (
          <div style={{ padding: '24px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h2 style={{ margin: 0, color: '#6BCB77' }}>Kids View</h2>
              <button onClick={() => setScreen('routines')} style={{ padding: '8px 12px', border: '1px solid #E5E5E5', borderRadius: '10px', background: 'white', fontWeight: 600 }}>Back</button>
            </div>
            <KidFriendlyView />
          </div>
        )}

        {screen === 'custody-settings' && (
          <CustodySettings
            onBack={() => setScreen('settings')}
            onSave={(settings) => {
              // Settings are already saved to localStorage by CustodySettings component
              // Could trigger a refresh of custody info here if needed
              setScreen('settings');
            }}
            currentSettings={(() => {
              try {
                return JSON.parse(localStorage.getItem('custodySettings') || '{}');
              } catch {
                return {};
              }
            })()}
          />
        )}


        {/* Modals */}
        {modal === 'crisis' && (
          <Modal title="Who's Involved?" onClose={closeModal}>
            <SituationCard
              icon={Users}
              title="Both Fighting"
              subtitle="Sibling conflict"
              onClick={() => showSituation('sibling-both')}
            />
            <SituationCard
              icon={User}
              title="Leo (8)"
              subtitle="ADHD, Dyslexia, Sensory"
              onClick={() => setModal('leo')}
            />
            <SituationCard
              icon={User}
              title="Emma (12)"
              subtitle="High-capacity, ASD traits"
              onClick={() => setModal('emma')}
            />
          </Modal>
        )}

        {modal === 'leo' && (
          <Modal title="Leo" onClose={closeModal}>
            <SituationCard
              icon={AlertTriangle}
              title="Hit/Hurt Emma"
              onClick={() => showSituation('leo-hit')}
            />
            <SituationCard
              icon={XCircle}
              title="Defiant/Refuses"
              onClick={() => showSituation('leo-defiant')}
            />
            <SituationCard
              icon={Zap}
              title="Meltdown"
              onClick={() => showSituation('leo-meltdown')}
            />
          </Modal>
        )}

        {modal === 'emma' && (
          <Modal title="Emma" onClose={closeModal}>
            <SituationCard
              icon={AlertTriangle}
              title="Triggering Leo"
              onClick={() => showSituation('emma-trigger')}
            />
            <SituationCard
              icon={MessageCircle}
              title="Teen Attitude"
              onClick={() => showSituation('emma-attitude')}
            />
          </Modal>
        )}

        {modal === 'response' && selectedSituation && (
          <Modal title={getCurrentScripts()[selectedSituation]?.title || 'Situation'} onClose={closeModal}>
            {currentRoutineSummary?.mode && currentRoutineSummary.mode !== 'hard' && currentRoutineSummary.mode !== 'hardest' && (
              <div style={{
                background: '#FFFBEB',
                border: '1px solid #FDE68A',
                borderRadius: '12px',
                padding: '12px',
                marginBottom: '12px'
              }}>
                <div style={{ fontWeight: 700, color: '#92400E', marginBottom: '6px' }}>Suggestion</div>
                <div style={{ color: '#B45309', marginBottom: '10px' }}>
                  This situation may be easier in Hard Mode this week.
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => switchRoutineMode('hard')} style={{ padding: '8px 12px', border: 'none', borderRadius: '10px', background: 'linear-gradient(135deg, #9D4EDD 0%, #FF6BCB 100%)', color: 'white', fontWeight: 600 }}>Switch to Hard</button>
                  <button onClick={() => setScreen('routines')} style={{ padding: '8px 12px', border: '1px solid #E5E5E5', borderRadius: '10px', background: 'white', fontWeight: 600 }}>Review Routine</button>
                </div>
              </div>
            )}
            <ResponseView 
              script={getCurrentScripts()[selectedSituation]?.scripts.balanced} 
              responseStyle="balanced"
              situation={getCurrentScripts()[selectedSituation]}
              energy={energy}
              currentRoutineSummary={currentRoutineSummary}
              setEnergy={setEnergy}
            />
          </Modal>
        )}

        {modal === 'homework' && (
          <Modal title="Homework Guide" onClose={closeModal}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '20px',
              padding: '28px 24px',
              marginBottom: '20px',
              border: '1px solid rgba(255, 255, 255, 0.5)'
            }}>
              <h2 style={{ color: '#4D96FF', marginBottom: '16px', fontSize: '1.2em' }}>After-School Routine</h2>
              <div style={{ lineHeight: 1.8 }}>
                <p style={{ marginBottom: '12px' }}><strong>5:00pm - Sensory First (10 min)</strong></p>
                <ul style={{ marginBottom: '20px', paddingLeft: '20px', color: '#9A938E' }}>
                  <li>10 wall pushes</li>
                  <li>Jump 20 times</li>
                  <li>Crunchy snack</li>
                </ul>
                <p style={{ marginBottom: '12px' }}><strong>5:10pm - Homework (2×15 min)</strong></p>
                <ul style={{ marginBottom: '20px', paddingLeft: '20px', color: '#9A938E' }}>
                  <li>Set timer: 15 minutes</li>
                  <li>He can wiggle, stand (OK!)</li>
                  <li>Break after beep (5 min)</li>
                  <li>Goal: Genuine attempt</li>
                </ul>
                <p style={{ marginBottom: '12px' }}><strong>5:45pm - Earned Screens</strong></p>
                <p style={{ color: '#9A938E', marginBottom: '8px' }}>IF tried: 30 minutes</p>
                <p style={{ color: '#9A938E' }}>IF refused: Outdoor play instead</p>
              </div>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '20px',
              padding: '28px 24px',
              border: '1px solid rgba(255, 255, 255, 0.5)'
            }}>
              <h2 style={{ color: '#6BCB77', marginBottom: '16px', fontSize: '1.2em' }}>Weekend Success Template</h2>
              <p style={{ color: '#9A938E', marginBottom: '16px', fontSize: '0.9em' }}>Based on Oct 12 success!</p>
              <ul style={{ lineHeight: 1.8, paddingLeft: '20px' }}>
                <li>Night before: Tell plan in bed</li>
                <li>Morning: He chooses breakfast</li>
                <li>Setup: Whiteboard plan together</li>
                <li>Structure: 30-min timer chunks</li>
                <li>Music: ADHD focus playlist</li>
                <li>Reward: Physical activity after</li>
              </ul>
            </div>
          </Modal>
        )}

        {/* Bottom Nav */}
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          maxWidth: '450px',
          width: '100%',
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(30px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.4)',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          padding: '8px 0 12px',
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.08)'
        }}>
          {[
            { key: 'home', icon: Home, label: 'Home' },
            { key: 'routines', icon: CalendarIcon, label: 'Routines' },
            { key: 'learn', icon: GraduationCap, label: 'Learn' },
            { key: 'settings', icon: Settings, label: 'Settings' }
          ].map(({ key, icon: Icon, label, disabled }) => (
            <button
              key={key}
              onClick={() => disabled ? alert(`${label} coming soon!`) : setScreen(key)}
              style={{
                padding: '8px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                textAlign: 'center',
                fontSize: '0.65em',
                fontWeight: 500,
                color: screen === key && !disabled ? '#9D4EDD' : '#718096',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Icon size={24} strokeWidth={screen === key && !disabled ? 2.5 : 2} />
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Helper Components
function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: '#F7F5F3',
      zIndex: 200,
      overflowY: 'auto'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(157, 78, 221, 0.95) 0%, rgba(255, 107, 203, 0.95) 100%)',
        backdropFilter: 'blur(20px)',
        color: 'white',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 210,
        borderBottom: '1px solid rgba(255, 255, 255, 0.25)'
      }}>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255, 255, 255, 0.25)',
            border: 'none',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '10px',
            fontSize: '0.95em',
            cursor: 'pointer',
            fontWeight: 500
          }}
        >
          ← Back
        </button>
        <div style={{ fontSize: '1em', fontWeight: 600 }}>{title}</div>
        <div style={{ width: '60px' }}></div>
      </div>
      <div style={{ padding: '20px' }}>
        {children}
      </div>
    </div>
  );
}

function SituationCard({ icon: Icon, title, subtitle, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'white',
        backdropFilter: 'blur(20px)',
        border: '1px solid #E5E5E5',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '12px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
      }}
    >
      <div style={{
        width: '56px',
        height: '56px',
        background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.25), rgba(157, 78, 221, 0.25))',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <Icon size={28} strokeWidth={2} color="#9D4EDD" />
      </div>
      <div>
        <h4 style={{ fontSize: '1em', marginBottom: '4px', fontWeight: 600 }}>{title}</h4>
        {subtitle && <p style={{ fontSize: '0.85em', color: '#9A938E' }}>{subtitle}</p>}
      </div>
    </div>
  );
}

function ResponseView({ script, responseStyle, situation, energy, currentRoutineSummary, setEnergy }) {
  if (!script) {
    return (
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '16px',
        border: '1px solid #E5E5E5',
        textAlign: 'center',
        color: '#9A938E'
      }}>
        Loading script...
      </div>
    );
  }

  return (
    <>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '16px',
        border: '1px solid #E5E5E5'
      }}>
        <h3 style={{
          fontSize: '0.85em',
          marginBottom: '12px',
          paddingBottom: '8px',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          color: '#9D4EDD'
        }}>1. Say (Firm & Calm)</h3>
        <div style={{
          fontSize: '1.1em',
          fontWeight: 500,
          background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(77, 150, 255, 0.1))',
          padding: '16px',
          borderRadius: '12px',
          borderLeft: '4px solid #9D4EDD',
          fontStyle: 'italic',
          lineHeight: 1.6
        }}>
          "{script.say}"
        </div>
      </div>

      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '16px',
        border: '1px solid #E5E5E5'
      }}>
        <h3 style={{
          fontSize: '0.85em',
          marginBottom: '12px',
          paddingBottom: '8px',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          color: '#4D96FF'
        }}>2. Do Right Now</h3>
        <div style={{ lineHeight: 1.7 }}>{script.do}</div>
      </div>

      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '16px',
        border: '1px solid #E5E5E5'
      }}>
        <h3 style={{
          fontSize: '0.85em',
          marginBottom: '12px',
          paddingBottom: '8px',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          color: '#6BCB77'
        }}>3. Don't</h3>
        <ul style={{ lineHeight: 1.7, paddingLeft: '20px' }}>
          {script.dont.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      </div>

      {script.tough && responseStyle === 'tough' && (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '16px',
          border: '1px solid #E5E5E5',
          borderLeft: '4px solid #FF6B6B'
        }}>
          <h3 style={{
            fontSize: '0.85em',
            marginBottom: '12px',
            paddingBottom: '8px',
            borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            color: '#FF6B6B'
          }}>🔥 Accountability Check</h3>
          <div style={{
            background: '#FEF2F2',
            padding: '16px',
            borderRadius: '12px',
            lineHeight: 1.7,
            fontWeight: 500
          }}>
            {script.tough}
          </div>
        </div>
      )}

      <div style={{
        background: '#F0F9FF',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '16px'
      }}>
        <h3 style={{
          fontSize: '0.85em',
          marginBottom: '12px',
          paddingBottom: '8px',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          color: '#4D96FF'
        }}>💡 Why This Works</h3>
        <div style={{ lineHeight: 1.7, fontSize: '0.95em' }}>{script.why}</div>
      </div>

      {/* Technique Used */}
      {script.technique && (
        <div style={{
          background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '16px',
          border: '1px solid #BAE6FD'
        }}>
          <h3 style={{
            fontSize: '0.85em',
            marginBottom: '12px',
            paddingBottom: '8px',
            borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            color: '#0369A1'
          }}>
            🎓 Technique Used
          </h3>
          <div style={{
            fontSize: '1em',
            fontWeight: 500,
            color: '#0C4A6E'
          }}>
            {script.technique}
          </div>
        </div>
      )}

      {/* Prevention Plan */}
      {situation?.prevention && (
        <div style={{
          background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '16px',
          border: '1px solid #BBF7D0'
        }}>
          <h3 style={{
            fontSize: '0.85em',
            marginBottom: '12px',
            paddingBottom: '8px',
            borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            color: '#166534'
          }}>
            🛡️ {situation.prevention.title}
          </h3>
          <ul style={{ lineHeight: 1.6, paddingLeft: '20px', margin: 0 }}>
            {situation.prevention.steps.map((step, i) => (
              <li key={i} style={{ marginBottom: '8px', color: '#15803D' }}>
                {step}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Learn More */}
      {situation?.learnMore && situation.learnMore.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '16px',
          border: '1px solid #F59E0B'
        }}>
          <h3 style={{
            fontSize: '0.85em',
            marginBottom: '12px',
            paddingBottom: '8px',
            borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            color: '#92400E'
          }}>
            📚 Learn More
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {situation.learnMore.map((technique, i) => (
              <span key={i} style={{
                background: 'rgba(255, 255, 255, 0.8)',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '0.85em',
                color: '#92400E',
                fontWeight: 500
              }}>
                {technique.replace('-', ' ')}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Week Mode Context Box */}
      {currentRoutineSummary?.mode === 'hard' && (
        <div style={{
          background: '#FFFBEB',
          border: '1px solid #FDE68A',
          borderRadius: '12px',
          padding: '16px',
          marginTop: '20px',
          marginBottom: '16px'
        }}>
          <div style={{ fontWeight: 700, color: '#92400E', marginBottom: '8px', fontSize: '0.9em' }}>
            🟡 You're in Hard Mode
          </div>
          <div style={{ color: '#B45309', fontSize: '0.95em', lineHeight: 1.5 }}>
            Expectations are lower this week. If you can't follow through perfectly today, that's okay.
          </div>
        </div>
      )}

      {currentRoutineSummary?.mode === 'hardest' && (
        <div style={{
          background: '#FFF1F1',
          border: '1px solid #FECACA',
          borderRadius: '12px',
          padding: '16px',
          marginTop: '20px',
          marginBottom: '16px'
        }}>
          <div style={{ fontWeight: 700, color: '#991B1B', marginBottom: '8px', fontSize: '0.9em' }}>
            🔴 You're in Survival Mode
          </div>
          <div style={{ color: '#DC2626', fontSize: '0.95em', lineHeight: 1.5 }}>
            The only goal is everyone alive and fed. If this situation feels impossible right now, it's okay to just survive it. You're doing great.
          </div>
        </div>
      )}

      {/* Energy Context Box */}
      {energy === 'running' && (
        <div style={{
          background: '#EFF6FF',
          border: '1px solid #BAE6FD',
          borderRadius: '12px',
          padding: '16px',
          marginTop: currentRoutineSummary?.mode ? '12px' : '20px',
          marginBottom: '16px'
        }}>
          <div style={{ fontWeight: 700, color: '#0369A1', marginBottom: '8px', fontSize: '0.9em' }}>
            🕐 Your Energy: Running Low
          </div>
          <div style={{ color: '#075985', fontSize: '0.95em', lineHeight: 1.5, marginBottom: '12px' }}>
            You're tired today. If you can't follow through perfectly on this, you're still a good parent. Do your best.
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setEnergy('survival')} style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', background: '#FEFCE8', border: '1px solid #FDE047', color: '#854D0E', fontWeight: 600, fontSize: '0.85em' }}>Switch to Survival</button>
          </div>
        </div>
      )}

      {energy === 'survival' && (
        <div style={{
          background: '#FEFCE8',
          border: '1px solid #FDE047',
          borderRadius: '12px',
          padding: '16px',
          marginTop: currentRoutineSummary?.mode ? '12px' : '20px',
          marginBottom: '16px'
        }}>
          <div style={{ fontWeight: 700, color: '#854D0E', marginBottom: '8px', fontSize: '0.9em' }}>
            ⚡ Your Energy: Survival Mode
          </div>
          <div style={{ color: '#A16207', fontSize: '0.95em', lineHeight: 1.5, marginBottom: '12px' }}>
            You're barely hanging on. If this feels impossible right now, it's completely okay to just get through the moment. Surviving is succeeding.
          </div>
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        marginTop: '20px'
      }}>
        <button
          onClick={() => alert('✓ Success logged!')}
          style={{
            padding: '14px',
            borderRadius: '12px',
            border: 'none',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.95em',
            background: 'linear-gradient(135deg, #9D4EDD 0%, #FF6BCB 100%)',
            color: 'white',
            boxShadow: '0 4px 12px rgba(157, 78, 221, 0.4)'
          }}
        >
          ✓ This Worked
        </button>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '14px',
            borderRadius: '12px',
            border: '2px solid #9D4EDD',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.95em',
            background: 'rgba(255, 255, 255, 0.9)',
            color: '#9D4EDD'
          }}
        >
          Done
        </button>
      </div>
    </>
  );
}