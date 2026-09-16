// src/i18n/earthquakeWorkplace.ts
// Natural Roman Hinglish localization for Commercial Workplace Earthquake Scenario.

import type { LocalizedScenarioData } from './types';

export const earthquakeWorkplaceHinglish: LocalizedScenarioData = {
  title: 'Office Workplace Bhukamp',
  subtitle: '7th Floor Tech Park Office · Dopehar 03:22',
  nodes: {
    'eqw-d1-tremor': {
      situationText:
        'Dopehar 03:22 baje. Aap 7th-floor open-plan office mein kaam kar rahe hain jab achaanak farsh zor se hilne lagta hai. False ceiling panels toot kar girte hain, monitors desks se phisal jaate hain, aur badi glass khidkiyan tezi se vibrate karti hain.',
      contextHint: 'Heavy overhead light fixtures aur glass partition toot kar gir rahe hain.',
      choices: {
        'eqw-c1-drop-desk': {
          label: 'Turant apni majboot steel-frame office desk ke neeche baith jayein, dono haatho se gardan dhankein, aur desk ke paaye ko kas ke pakdein.',
          consequenceText:
            'Aap majboot desk ke neeche chale gaye. Agle hi pal overhead lights aur ceiling panels desk ke upar gir kar chhitak gaye. Aap surakshit rahe jab tak jhatke poori tarah thham nahi gaye.',
          insight:
            'NDMA Drop, Cover, and Hold On niyam ke mutabik high-rise corporate office mein majboot desk ke neeche sharan lena hi ceiling aur glass hazards se bachata hai.',
          insightSource: 'NDMA Earthquake Safety Guidelines',
        },
        'eqw-c1-rush-elevator': {
          label: 'Power cut hone se pehle central elevator lobby ki taraf daud padein.',
          consequenceText:
            'Tez jhatkon ne aapka balance bigad diya aur aap filing cabinet se takra gaye. Ek falling ceiling panel ne aapke kandhe par chot lagayi, aur elevators emergency brake par lock ho gaye.',
          insight:
            'Bhukamp ke dauran elevator ki taraf bhagna bohot khatarnak hai. Lifts beech raste power cut ya cable derailment se death trap ban sakti hain.',
          insightSource: 'NDMA High-Rise Evacuation Protocols',
        },
        'eqw-c1-balcony-window': {
          label: 'Outer glass facade ke paas jaakar dekhein ki sadak par kitna nuksaan hua hai.',
          consequenceText:
            'Seismic pressure se exterior curtain wall ka bada glass pane toot gaya. Teekhe kaanch ke tukde udkar aapke haathon aur jacket ko cheer gaye.',
          insight:
            'Bhukamp ke dauran exterior glass walls bohot tezi se toot kar bikharte hain. NDMA guidelines khidkiyon aur glass surfaces se door rehne ki hidayat deti hain.',
          insightSource: 'NDMA High-Rise Earthquake Advisory',
        },
      },
    },

    'eqw-d2-corridor-debris': {
      situationText:
        'Primary jhatke band ho gaye hain. Farsh par plaster, wiring aur toote monitors bikhre hain. Emergency battery lights chal rahi hain. Main office exit door ek tede bookcase se atka hua hai.',
      contextHint: 'Exit ko aaraam se clear karein aur bikhri hui bijli ki taaron ka dhyan rakhein.',
      choices: {
        'eqw-c2-team-clear-exit': {
          label: 'Do saathiyon ko bulakar bookcase ko milkar hatayein, aur nangi taaron ko dekhkar corridor mein aage badhein.',
          consequenceText:
            'Milkar kaam karne se bookcase bina kisi aur girawat ke hat gaya. Farsh par spark karti live wire se bachate hue aapne sabko fire stairwell tak pahunchaya.',
          insight:
            'Aapsi sahyog aur bikhri live wiring ka dhyan rakhna corporate offices mein bhukamp ke baad secondary electrocution se bachata hai.',
          insightSource: 'NDMA Workplace Emergency Protocols',
        },
        'eqw-c2-force-door-alone': {
          label: 'Akele hi apne kandhe se zor laga kar darwaze ko todne ki koshish karein.',
          consequenceText:
            'Zor lagane se upar se ek metal cable tray jhul kar aapki peeth par lagi, jisse sabhi logon ke bahar nikalne mein der ho gayi.',
          insight:
            'Damaged buildings mein akele physical zor lagane se overhead structures girne ka khatra badh jata hai.',
          insightSource: 'NDMA Workplace Safety Protocols',
        },
      },
    },

    'eqw-d2b-injured-escape': {
      situationText:
        'Chotil kandhe ko sambhalte hue aap exit ke paas pahunche. Log ghabraye hue hain aur lifts band hain. Server room se jali hui taaron ka dhuan aane laga hai.',
      contextHint: 'Panic rokein aur designated safety warden ya first aid kit ki madad lein.',
      choices: {
        'eqw-c2b-rally-warden': {
          label: 'Floor emergency kit nikaal kar kandhe ko support karein aur sabko Fire Exit B ki taraf shaanti se aage badhne ko kahein.',
          consequenceText:
            'Aapke calm instructions ne panic ko rok diya. Sabhi log ek line mein safe fire staircase ki taraf nikal gaye, dhuan se bachte hue.',
          insight:
            'Emergency floor warden training aur shaant aawaz mein hidayat dena corporate buildings mein stampede ko rokkne ke liye zaroori hai.',
          insightSource: 'NDMA Commercial Building Evacuation',
        },
        'eqw-c2b-blind-rush': {
          label: 'Zor se chillayein ki aag lag rahi hai aur bheed mein se aage nikalne ki koshish karein.',
          consequenceText:
            'Aapke chillane se darwaze par bh भगदड़ mach gayi. Do log taaron mein ulajh kar gir gaye aur exit block ho gaya.',
          insight:
            'Chillana aur dhakka-mukki karna exit par stampede banata hai. Calm rehkar nikalne se hi sabki suraksha hoti hai.',
          insightSource: 'NDMA Emergency Crowd Safety Principles',
        },
      },
    },

    'eqw-d3-staircase-choice': {
      situationText:
        'Aap Fire Staircase B se neeche utar rahe hain. 4th floor par aate hi ek tez 5.2 magnitude ka aftershock shuru hota hai. Concrete seedhiyan hilne lagti hain aur shaft mein dhool girti hai.',
      contextHint: 'Seedhiyon par active tremor ke waqt daudna bohot khatarnak hai.',
      choices: {
        'eqw-c3-crouch-landing': {
          label: 'Turant landing par ruk kar majboot deewar ke sahare jhuk jayein, sir ko bachayein, aur hilna band hone tak intezar karein.',
          consequenceText:
            'Landing par jhukne se aap girne se bach gaye. Girte hue kankad-patthar central opening se neeche gir gaye. Jhatka rukne par aap aaram se neeche utar gaye.',
          insight:
            'Hilte hue steps par daudne se fatal fall hota hai. NDMA protocol ke mutabik seedhiyon par aftershock aane par landing par deewar se lagkar baithna chahiye.',
          insightSource: 'NDMA Stairway Safety Protocol',
        },
        'eqw-c3-continue-sprinting': {
          label: 'Stairwell girne se pehle tezi se do-do seedhiyan koodte hue neeche bhaagein.',
          consequenceText:
            'Hilti seedhiyon par pair phisal gaya aur aap concrete par gir kar apna takhna (ankle) chotil kar baithe.',
          insight:
            'Tremor ke waqt seedhiyon par bhaagna fractures aur severe injury ka mukhya kaaran banta hai.',
          insightSource: 'NDMA Stairway Safety Protocol',
        },
      },
    },

    'eqw-d4-lobby-hazard': {
      situationText:
        'Aap ground floor reception atrium mein pahunche. Upar ka glass skylight chatak chuka hai. Bahar driveway par 3rd floor ke facade stone panels gir kar toot rahe hain.',
      contextHint: 'Girta hua facade stone aur glass revolving doors mukhya khatra hain.',
      choices: {
        'eqw-c4-side-canopy-exit': {
          label: 'Revolving door chhod kar side emergency push-bar door use karein aur sir par briefcase rakhte hue open lawn ki taraf daud jayein.',
          consequenceText:
            'Side exit asani se khul gaya. Girte hue architectural fragments se briefcase se bachte hue aap 50-meter perimeter paar kar safe maidan mein pahunch gaye.',
          insight:
            'Revolving doors structure tedha hone par jam ho jaate hain. Side emergency exit aur building perimeter se door jaana hi surakshit tarika hai.',
          insightSource: 'NDMA High-Rise Evacuation Guidelines',
        },
        'eqw-c4-atrium-wait': {
          label: 'Glass atrium ke andar khade hokar intezar karein jab tak security bahar aane ka signal na de.',
          consequenceText:
            'Intezar ke dauran chhat ke glass skylight se do bhaari sheeshe gir kar toot gaye aur kaanch ke tukde charon taraf bikhar gaye.',
          insight:
            'Glass atrium bhukamp ke baad fractured glass falling hazard ban jaate hain. Khule maidan mein nikalna zaroori hai.',
          insightSource: 'NDMA Building Safety Advisory',
        },
      },
    },

    'eqw-d5-assembly-communication': {
      situationText:
        'Aap office park ke open assembly ground par pahunch gaye hain. Saikdon log ikatthe hain. Voice phone network jam ho chuka hai.',
      contextHint: 'Emergency lines ko free rakhein aur parivar tak khabar pahunchayein.',
      choices: {
        'eqw-c5-sms-checkin': {
          label: 'Parivar ko SMS bhej kar apni khairiyat batayein aur floor safety marshal ko apna naam note karwayein.',
          consequenceText:
            'Network jam hone ke bawajood SMS turant deliver ho gaya. Safety marshal ne confirm kiya ki aapki team surakshit hai.',
          insight:
            'Aapda ke samay voice calls network ko crash kar deti hain. NDMA aur 112 ERSS SMS use karne ki salah dete hain taaki emergency services active rahein.',
          insightSource: '112 ERSS Emergency Communication Standard',
        },
        'eqw-c5-repeated-calls': {
          label: 'Baar-baar phone dial karte rahein aur social media par video live stream karein.',
          consequenceText:
            'Calls nahi lagi aur battery jaldi khatam ho gayi, jabki safety register mein aapka naam bhi darj nahi ho saka.',
          insight:
            'Repeated redialing emergency bandwidth chheen leti hai aur battery khatam karti hai.',
          insightSource: 'NDMA Telecommunication Advisory',
        },
      },
    },
  },
};
