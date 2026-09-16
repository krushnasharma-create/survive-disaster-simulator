// src/i18n/flood.ts
// Natural Roman Hinglish localization for Flood disaster scenario.

import type { LocalizedScenarioData } from './types';

export const floodHinglish: LocalizedScenarioData = {
  title: 'Flash Flood Ka Sankat',
  subtitle: 'Low-Lying Colony — Monsoon Cloudburst',
  nodes: {
    // NODE 1: Inundation & Utility Isolation
    'flood-d1-warning': {
      situationText:
        'Monsoon cloudburst se aapki colony mein achanak tezz flash flood aa gaya hai. Ganda mitti-bhara paani har minute kayi inch badh raha hai aur aapke ground floor ke porch tak pahunch chuka hai. Phone par emergency alert tezi se bajta hai.',
      contextHint: 'Paani samne ke darwaze ke neeche se living room mein ghusna shuru ho chuka hai.',
      choices: {
        'flood-c1-isolate-utilities': {
          label:
            'Turant main bijli ka MCB switch aur LPG cylinder ka valve band karein, zaroori emergency bag lein aur oopar jane ki taiyyari karein.',
          consequenceText:
            'Aap main breaker aur gas cylinder dono band kar dete hain. Paani ghar mein aane ke bawajood bijli ka jhatka (electrocution) ya dhmake ka jaanleva khatra taal jata hai.',
          insight:
            'Aam suraksha guidelines ke mutabiq baadh ka paani aane se pehle bijli aur gas band kar dena chahiye taaki current lagne aur aag lagne ka khatra khatam ho sake.',
          insightSource: 'NDMA Urban Flood Safety Advisory',
        },
        'flood-c1-wait-indoors': {
          label:
            'Living room ke darwaze par door mats aur geele tauliye laga kar paani ko andar aane se rokne ki koshish karein.',
          consequenceText:
            'Paani ka tezz dhabaw tauliyon ko baha le jata hai. Pindliyon tak ganda paani bhar jata hai, jisse floor extension cords doob jate hain aur electric spark hone lagta hai.',
          insight:
            'Tezi se aate baadh ke paani ko tauliyon se rokne mein samay barbad na karein. Doobe hue electric plug aur cords jaanleva current peda kar dete hain.',
          insightSource: 'NDMA Flood Preparedness Guidelines',
        },
      },
    },

    // NODE 2A: Rising Water — Vertical Evac
    'flood-d2-rising-water': {
      situationText:
        'Ground floor par kayi inch paani bhar chuka hai. Bahar sadak ek tezz mitti-bhari nadi ban chuki hai jismein kachra tair raha hai. Aapke do-manzila ghar mein andar se oopri kamron aur pakki chhat par jane ka concrete rasta hai.',
      contextHint: 'Bahar sadak par gehra, tezz bahav hai jismein anjaan khatre chhipe hain.',
      choices: {
        'flood-c2-vertical-evac': {
          label:
            'Zaroori samaan, peene ka saaf paani, mobile phone aur first-aid kit lekar oopri manzil aur chhat ki taraf chale jayein.',
          consequenceText:
            'Aap zaroori samaan ke saath pehli manzil par chale jate hain. Ground floor ke doobne ke bawajood aap tezz paani ke bahav se poori tarah surakshit rehte hain.',
          insight:
            'Flash flood ke dauran jab zameen ke raste band hon, toh oopri manzil ya pakki chhat par vertical refuge lena sadak ke bahav aur khule naalon se bachata hai.',
          insightSource: 'NDMA Flood Safety Protocol',
        },
        'flood-c2-drive-car': {
          label:
            'Driveway mein khadi sedan car mein baith kar sadak ke paani se hote hue oonchi jagah nikalne ki koshish karein.',
          consequenceText:
            'Car sadak par nikalte hi gehre paani mein band ho jaati hai. Tezz bahav gadi ko side ke bade drain ki taraf khinchne lagta hai, aur aapko mushkil se bahar nikalna padta hai.',
          insight:
            'Baadh ke paani mein gadi chalane ki galti kabhi na karein. Gadiyan tezz bahav mein beh sakti hain aur doobi hui sadak neeche se tooti ya dhas sakti hai.',
          insightSource: 'Public Flood Safety Advisory',
        },
      },
    },

    // NODE 2B: Delayed Utility
    'flood-d2b-delayed-utility': {
      situationText:
        'Ground floor ke hallway mein ghutno tak paani bhar chuka hai. Doobe hue switchboard se buzzing aawaz aa rahi hai, aur main electric board doosre kone mein hai.',
      contextHint: 'Bijli ke live taaron ya boards ke paas paani mein khade hona behad khatarnak hai.',
      choices: {
        'flood-c2b-avoid-live-water': {
          label:
            'Current wale paani mein aage na badhein; turant sukhi seedhiyon se oopar chale jayein aur padosiyon ko bhi aagaah karein.',
          consequenceText:
            'Aap current wale paani mein kadam nahi rakhte aur oopar chale jate hain. Kuch hi pal mein transformer trip ho jata hai aur bijli chali jaati hai.',
          insight:
            'Agar paani mein current hone ka shaq ho toh kabhi usme kadam na rakhein. Urban flooding ke waqt electrocution sabse ahem secondary khatron mein se ek hai.',
          insightSource: 'NDMA Urban Flood Safety Guidelines',
        },
        'flood-c2b-wade-to-breaker': {
          label:
            'Nange pair ghutno tak paani mein chalkar board tak jayein aur switch band karne ki koshish karein.',
          consequenceText:
            'Doobe hue cord ke paas pahunchte hi pairon mein tezz current ka jhatka lagta hai. Aap kisi tarah railing pakad kar khud ko upar khinchte hain.',
          insight:
            'Current wale paani mein chalkar switchboard tak na jayein. Agar bina paani chuye switch off nahi ho sakta, toh use touch karne ka jokhim na lein.',
          insightSource: 'Public Electrical Safety Advisory',
        },
      },
    },

    // NODE 3: Indoor Hazards
    'flood-d3-indoor-hazard': {
      situationText:
        'Aap pehli manzil par surakshit hain, par achanak kitchen ke nal (tap) se mitti-bhara ganda paani aane lagta hai. Poore ilaqe ki bijli band hai. Aage ke liye peene ka paani surakshit rakhna zaroori hai.',
      contextHint: 'Baadh ka ganda paani aksar ground water supply aur underground tanks mein ghus jata hai.',
      choices: {
        'flood-c3-safe-drinking-water': {
          label:
            'Ghar mein rakha packaged/bottled paani dhyan se bacha kar rakhein, nal ka bina ubla paani na piyein, aur khane ko oonchi jagah rakhein.',
          consequenceText:
            'Aap peene ke saaf paani ki bachat karte hain aur gande paani se hone wali pet ki bimariyon (waterborne diseases) se bache rehte hain.',
          insight:
            'Baadh ka paani sewage aur bimariyon se bhara hota hai jo pipe lines ko dushit kar deta hai. Sirf bottled, achhi tarah ubla ya filter kiya paani hi piyein.',
          insightSource: 'NDMA Health & Sanitation Guidelines in Disasters',
        },
        'flood-c3-drink-tap-water': {
          label:
            'Balti bhar kar nal ka paani peene ke liye istemal karein kyunki abhi tap pressure chal raha hai.',
          consequenceText:
            'Nal ke paani mein badboo aur mitti ghuli hai. Yeh paani peene se tez vomiting aur pet kharab hone ka jokhim turant paida ho jata hai.',
          insight:
            'Baadh ke dauran municipal ya underground tank ka paani bina uble kabhi na piyein, jab tak official roop se uske saaf hone ki pushti na ho.',
          insightSource: 'Public Health Disaster Advisory',
        },
      },
    },

    // NODE 4: Route Hazard
    'flood-d4-route-hazard': {
      situationText:
        'Balcony se aap dekhte hain ki chaar gali door main road par ek relief truck khada hai. Par aapke ghar aur road ke beech ke chowk par seene tak tezz mitti ka bahav hai aur khule naale chhipe hain.',
      contextHint: 'Behte paani ke neeche toote hue khambe, khule manholes aur gaddhe chhipe rehte hain.',
      choices: {
        'flood-c4-remain-elevated': {
          label:
            'Oopri manzil par surakshit rukein; bina rescue team ke seene tak behte paani ko paidal paar karne ka risk na lein.',
          consequenceText:
            'Aap oopar hi rehte hain. Thodi der baad aap dekhte hain ki ek lohe ki sheet aur lakdi ka khamba tezi se us chowk se behkar nikla, jisse aap bach gaye.',
          insight:
            'Tezz baadh ke paani mein paidal chalne ya tairne ka prayog na karein. Chhipe hue pathar, kachra, khule manholes aur tezz bahav behad jaanleva hote hain.',
          insightSource: 'NDMA Flood Evacuation Guidance',
        },
        'flood-c4-rush-relief-truck': {
          label:
            'Neeche utar kar seene tak gehre paani mein relief truck ki taraf nikalne ki koshish karein.',
          consequenceText:
            'Paani ka bhari dhabaw aapko boundary pillar se takra deta hai. Ek chhipa hua drain aapko khinchne hi wala hota hai ki aap wapas gate pakad lete hain.',
          insight:
            'Gehre aur tezz behte paani mein chalkar nikalna shahri baadh mein maut ka sabse bada kaaran banta hai. Chhipe manholes mein girna atyant aam hai.',
          insightSource: 'Central Water Commission (CWC) Flood Safety Guidance',
        },
      },
    },

    // NODE 5: Emergency Comm
    'flood-d5-emergency-comm': {
      situationText:
        'Aapke mobile ki battery 42% hai aur network baar-baar aa-ja raha hai. Aapko emergency relief teams ko apni exact location batani hai aur mosam ki jankari leni hai.',
      contextHint: 'Disaster ke dauran mobile battery bachana aur kam data wala message bhejna ahem hota hai.',
      choices: {
        'flood-c5-conserve-battery-sms': {
          label:
            'Phone ko battery-saver mode par daalein, 112 ERSS aur parivaar ko SMS se apna exact address bhejein aur official alerts track karein.',
          consequenceText:
            'Aapka SMS 112 control room tak pahunch jata hai aur battery bachi rehti hai, jisse emergency ke dauran aapka phone switch off nahi hota.',
          insight:
            'Bijli na hone par phone ki battery bachayein. Video call ke badle chhota SMS ya emergency SOS bhejein taaki zaroorat ke waqt phone chalta rahe.',
          insightSource: '112 ERSS Emergency Communication Guidelines',
        },
        'flood-c5-stream-social-media': {
          label:
            'Full brightness par social media par lagatar live video chala kar sadak ka nazara dikhate rahein.',
          consequenceText:
            'Live stream karne se 40 minute mein battery 4% ho jaati hai. Jab rescue boat aati hai, tab aapka phone dead ho chuka hota hai aur aap call nahi kar paate.',
          insight:
            'Aapda ke waqt non-essential streaming mein phone ki battery khatam na karein. Life-saving rescue communication ke liye charge bacha kar rakhein.',
          insightSource: 'NDMA Disaster Communication Advisory',
        },
      },
    },

    // NODE 6: Stranded Rooftop
    'flood-d6-stranded-rooftop': {
      situationText:
        'Sadak ke paani se bachkar nikalne ke baad aap poori tarah bheege hue hain, thand lag rahi hai, aur chhat par lagatar tezz barish ho rahi hai. Raat hone ko hai.',
      contextHint: 'Monsoon barish aur bheege kapdon se hypothermia aur thakan ka jokhim badh jata hai.',
      choices: {
        'flood-c6-seek-dry-cover': {
          label:
            'Chhat ke stairwell canopy ke neeche jayein, bheege kapde nichodein aur sukhe parde ya plastic sheet lapet kar shareer ko garam rakhein.',
          consequenceText:
            'Aap concrete shed ke neeche hawa aur barish se bach jaate hain aur plastic lapetne se shareer ka taapmaan theek rehta hai.',
          insight:
            'Barish aur bheege kapdon mein der tak rehne se tropical mausam mein bhi hypothermia ho sakta hai. Hawa aur bauchhar se bachkar shareer ko dhaanpein.',
          insightSource: 'Public Emergency Health Advisory',
        },
        'flood-c6-stay-in-open-rain': {
          label:
            'Chhat ke kone par khule aakash ke neeche barish mein khade ho kar haath hilate rahein ki door se koi dekh le.',
          consequenceText:
            'Tezz thandi barish mein lagatar khade rehne se thandi kapkapi aur kamzori aane lagti hai, jisse aage rescue ke waqt josh nahi bachta.',
          insight:
            'Bina wajah tezz barish mein khade na rahein. Apni energy bacha kar rakhein aur jab rescue team paas aaye tabhi open mein signal karein.',
          insightSource: 'Emergency Preparedness Standard',
        },
      },
    },

    // NODE 7: Rescue Signaling
    'flood-d7-rescue-signaling': {
      situationText:
        'Colony mein motorboat ki aawaz sunai deti hai. National Disaster Response Force (NDRF) ki inflatable boat searchlight jalaye hue aapki gali mein daakhil hoti hai.',
      contextHint: 'Rescuers ko saaf visual signal aur disciplined tareeke se boat par chadhne ki zaroorat hoti hai.',
      choices: {
        'flood-c7-signal-and-board-calmly': {
          label:
            'Chamakte kapde ya torch se boat ki taraf ishara karein, shanti se aawaz dein, aur NDRF crew ke nirdeshon ke mutabiq aaram se boat mein baithein.',
          consequenceText:
            'NDRF team aapka signal dekh kar boat ko balcony ke paas laati hai, aapko life jacket pehnati hai aur surakshit tarike se baithati hai.',
          insight:
            'Search team ko torch, seeti (whistle) ya chamkile kapde se signal dein. Rescue boat par chadhne ke waqt jaldbaazi na karein taaki boat ka balance na bigde.',
          insightSource: 'NDRF Water Rescue & Evacuation Protocol',
        },
        'flood-c7-jump-into-boat': {
          label:
            'Seat pane ke darr se pehli manzil ki railing se seedhe aati hui rescue boat par chhalang laga dein.',
          consequenceText:
            'Aapke achanak koodne se inflatable boat lagbhag palat jaati hai. Aap doosre shaks par girte hain aur pair mein chot lagti hai, jisse log ghabra jate hain.',
          insight:
            'Rescue boat par kabhi chhalang na lagayein. Rubber inflatable boat achanak dabaw se palat sakti hai ya phat sakti hai. Hamesha crew ke kehne par hi baithein.',
          insightSource: 'NDRF Water Rescue Safety Guidelines',
        },
      },
    },

    // OUTCOME
    'flood-outcome-node': {
      narrativeText:
        'Aapko NDRF rescue personnel dwara surakshit nikal liya gaya hai. Bijli aur gas band karne, oopri refuge lene, behte paani mein na jane aur rescue team ke niyam maanne se aapki jaan bachi.',
    },
  },
};

export const FLOOD_HINGLISH_TAKEAWAYS: string[] = [
  'BIJLI AUR GAS MAINS PEHLE BAND KAREIN: Baadh ka paani ghar mein aane se pehle main MCB switch aur gas cylinder valve band karein taaki current aur aag lagne ka jaanleva khatra na ho.',
  'OOPAR VERTICAL REFUGE LEIN: Agar sadak par paani bhar gaya ho, toh behte paani mein paidal nikalne ke bajaye oopri manzil ya pakki chhat par surakshit panah lein.',
  'BEHTE PAANI MEIN KABHI NA CHALEIN YA CAR NA CHALAYEIN: Tezz behte paani ke neeche khule manholes, toote khambe aur gaddhe chhipe rehte hain. Sirf thoda bahav bhi kisi ko baha le ja sakta hai.',
  'PEENE KA SAAF PAANI SURAKSHIT RAKHEIN: Baadh ka paani sewage aur bimariyon se bhara hota hai jo water supply ko dushit kar deta hai. Sirf packaged ya ubla hua paani hi piyein.',
  'BATTERY BACHAYEIN AUR 112 KO SMS KAREIN: Prolonged power cut mein phone battery bacha kar rakhein. Parivaar aur 112 ERSS ko address aur location ka concise SMS bhejein.',
];