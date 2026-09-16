// src/i18n/fire.ts
// Natural Roman Hinglish localization for Structure Fire Disaster Scenario.

import type { LocalizedScenarioData } from './types';

export const fireHinglish: LocalizedScenarioData = {
  title: 'Building Mein Aag Ka Sankat',
  subtitle: 'Residential Multi-Storey Building — Raat 02:13 AM',
  nodes: {
    'fire-d1-alarm': {
      situationText:
        '02:13 AM. Smoke alarm ki tezz, chubhti hui aawaz se aapki neend khulti hai. Bedroom mein ghanghor andhera hai. Band darwaze ke neeche se halki aag ki chamak aur kaala badboodar dhuan floor par sarakta hua andar aa raha hai.',
      contextHint: 'Aapka darwaza band hai. Doosri taraf aag aur dhuan phail chuka hai.',
      choices: {
        'fire-c1-back-of-hand': {
          label:
            'Darwaze aur metal doorknob ko kholne se pehle apne haath ke pichle hisse (back of hand) se halka chhoo kar heat test karein.',
          consequenceText:
            'Knob thanda mehsoos hota hai. Neeche jhuk kar aap darwaze ko do inch kholte hain. Corridor mein upar dhuan hai par neeche rasta dikh raha hai.',
          insight:
            'Darwaza kholne se pehle hamesha haath ke pichle hisse se garmi test karein. Garm darwaze ka matlab doosri taraf bhayanak aag hai jisse flashover ho sakta hai.',
          insightSource: 'NDMA Fire Safety Guidelines',
        },
        'fire-c1-open-wide': {
          label:
            'Turant darwaza poora khol kar corridor mein tezi se bahar bhagein.',
          consequenceText:
            'Darwaza kholte hi garm hawa aur zehreela kaala dhuan kamre mein ghus jata hai, jisse aakhon mein jalan hoti hai aur tezz khansi shuru ho jaati hai.',
          insight:
            'Aag ke dauran darwaza achanak poora na kholein. Oxygen milne se aag aur bhadakti hai aur zehreeli gas seedhi kamre mein ghus jaati hai.',
          insightSource: 'NDMA Fire Safety Guidelines',
        },
      },
    },

    'fire-d2-smoke-crawl': {
      situationText:
        'Aap hallway mein hain. Kaala zehreela dhuan ceiling ke paas jam raha hai aur dheere-dheere neeche utar raha hai. Staircase ka darwaza 30 feet aage hai.',
      contextHint: 'Zehreela dhuan upar uthata hai; saaf hawa floor ke paas rehti hai.',
      choices: {
        'fire-c2-crawl-low': {
          label:
            'Ghutno ke bal baith kar dhuein ke neeche reng kar (crawl) aage badhein, sar ko zameen se 1-2 feet upar rakhein.',
          consequenceText:
            'Neeche rehne se aapko saaf aur thandi hawa milti hai aur baseboards saaf dikhte hain, jisse aap surakshit staircase door tak pahunchte hain.',
          insight:
            'Aag ke dauran garm zehreela dhuan upar rehta hai. Floor se 30-60 cm upar thandi aur saaf hawa rehti hai. Hamesha jhuk kar chalein.',
          insightSource: 'NDMA & Fire Service Safety Guidelines',
        },
        'fire-c2-run-upright': {
          label:
            'Seedhe khade ho kar saans rok kar tezi se aage daudein.',
          consequenceText:
            'Seedhe khade hone se aapka gala dhuein ki lapet mein aa jata hai aur carbon monoxide se chakkar aane lagte hain, jisse aap deewar se takra jaate hain.',
          insight:
            'Aag mein sabse zyada jaan dhuein se jaati hai. Seedhe khade rehne se zehreeli superheated gas fefdo mein chali jaati hai.',
          insightSource: 'NDMA Fire Safety Guidelines',
        },
      },
    },

    'fire-d2b-smoke-room': {
      situationText:
        'Kaala dhuan corridor mein bhar chuka hai aur kamre mein tezi se ghus raha hai. Bina kisi suraksha ke hallway mein nikalna turant dam ghont sakta hai.',
      contextHint: 'Hallway bina bandobast ke paar karna namumkin hai.',
      choices: {
        'fire-c2b-retreat-seal': {
          label:
            'Turant bedroom ka darwaza band karein, neeche ki daraar ko geele kapde ya bedsheet se seal karein, aur khidki ke paas ja kar signal karein.',
          consequenceText:
            'Darwaza band karke geeli sheet lagane se dhuan ruk jata hai. Kamre ki hawa theek rehti hai aur aapko madad bulane ka zaroori waqt milta hai.',
          insight:
            'Agar rasta dhuein se band ho jaye, toh kamre ka darwaza band karke geele kapde se seal karein aur khidki se madad ka signal dein.',
          insightSource: 'NDMA Residential Fire Directives',
        },
        'fire-c2b-blind-dash': {
          label:
            'Apni sookhi shirt se naak dhak kar bina dekhe hallway mein daud laga dein.',
          consequenceText:
            'Sookha kapda carbon monoxide ko nahi rok sakta. Kaale dhuein mein aakhein band ho jaati hain aur aap rasta bhatak kar stairwell ke frame se takra jaate hain.',
          insight:
            'Sookha kapda zehreeli gas nahi chhan sakta. Dhuein mein bina dekhe daudna disorient kar deta hai aur dam ghutne ka khatra hota hai.',
          insightSource: 'NDMA Fire Emergency Standards',
        },
      },
    },

    'fire-d3-staircase-block': {
      situationText:
        'Aap 3rd floor ke main staircase landing par pahunchte hain. Darwaza kholte hi dekhte hain ki neeche ki floor se stairwell mein bhari dhuan upar chad raha hai. Paas mein lift khuli khadi hai.',
      contextHint: 'Stairwell dhuein ka chimney ban chuka hai.',
      choices: {
        'fire-c3-reclose-alternate': {
          label:
            'Turant staircase ka darwaza band karke dhuan rokein, aur building ke doosre kone par bane external fire escape ki taraf jayein.',
          consequenceText:
            'Darwaza band karne se stairwell ka dhuan floor par nahi phailta. Emergency signs ko follow karke aap building ke pichhle hisse mein bane external fire escape par pahunchte hain.',
          insight:
            'Agar staircase mein bhari dhuan ho toh andar na ghusein. Darwaza band karein taaki dhuan na phaile aur doosra rasta ya external fire escape chunein.',
          insightSource: 'NDMA High-Rise Building Safety Guidelines',
        },
        'fire-c3-enter-smoke-stairs': {
          label:
            'Rail pakad kar dhuein ke beech se hi neeche utarne ki koshish karein.',
          consequenceText:
            'Aadhi seedhi utarte hi tezz garmi aur kaala dhuan aapko peeche dhakel deta hai. Khansi aur aakhon mein jalan ke saath aap wapas landing par aate hain.',
          insight:
            'Stairwell mein uth rahe dhuein ke beech se neeche utarne ka prayas na karein. Neeche aag ke paas garmi aur zehreeli gas aur zyada hoti hai.',
          insightSource: 'NDMA Fire Safety Guidelines',
        },
        'fire-c3-take-elevator': {
          label:
            'Khuli hui lift mein ghus kar ground floor ka button dabayein taaki jaldi nikal sakein.',
          consequenceText:
            'Lift mein ghuste hi power cut ho jata hai aur lift do floors ke beech atak jaati hai. Lift ka shaft dhuein ko kheench kar aapko trap kar leta hai.',
          insight:
            'Aag ke dauran lift ka prayog kabhi na karein. Power cut se lift beech mein phas sakti hai aur shaft mein dhuan tezi se ghus jata hai.',
          insightSource: 'NDMA Fire Safety Protocols',
        },
      },
    },

    'fire-d4-external-escape': {
      situationText:
        'Aap external lohe ke fire escape par aate hain. Taazi hawa milti hai par neeche ki khidkiyon se dhuan nikal raha hai. Aapke aage ek padosi ghabrahat mein freeze ho gaya hai.',
      contextHint: 'Seedhiyon par ghabrahat aur bheed jamne se bachein.',
      choices: {
        'fire-c4-guide-calmly': {
          label:
            'Rail ko majbooti se pakadein, padosi ke kandhe par sahara de kar use shant karein aur sath mein niyamit gati se neeche utarein.',
          consequenceText:
            'Aapki shant aawaz se padosi sambhal jata hai. Dono bina phisle seedhiyon se surakshit dhang se neeche utar aate hain.',
          insight:
            'Emergency mein shanti banaye rakhein aur rail pakad kar chalein. Ek doosre ko sambhalne se seedhiyon par bhagdadh ya girne ka khatra talta hai.',
          insightSource: 'NDMA Disaster Management Principles',
        },
        'fire-c4-push-past': {
          label:
            'Padosi ko dhakka dekar aage niklein aur tezi se daud kar neeche bhagein.',
          consequenceText:
            'Dhakka lagne se padosi girte-girte bachta hai aur aapka pair bhi phisal jata hai, jisse chot aati hai aur bheed mein asuraksha phailti hai.',
          insight:
            'Seedhiyon par dhakkam-dhakka karne se log gir sakte hain aur rasta band ho sakta hai, jo sabke liye jaanleva hota hai.',
          insightSource: 'NDMA Public Safety Advisory',
        },
      },
    },

    'fire-d4b-window-signal': {
      situationText:
        'Aap bedroom mein surakshit band hain aur dhuan ruka hua hai. Khidki se neeche courtyard mein emergency services ki laal batti chamak rahi hai.',
      contextHint: 'Rescuers ko apni exact jagah batayein.',
      choices: {
        'fire-c4b-bright-cloth-light': {
          label:
            'Safed ya chamkila kapda khidki ke bahar latkayein aur mobile flashlight se signal dete hue apna floor number chillayein.',
          consequenceText:
            'Ground par khade firefighters ne chamkila kapda aur roshni turant dekh li. Kuch hi der mein hydraulic ladder aapki khidki ki taraf bhej di gayi.',
          insight:
            'Agar room mein trap ho jayein toh chamkila kapda dikha kar aur torch se signal dein. Khidki ko pura na kholein taaki bahar ka dhuan andar na aaye.',
          insightSource: 'NDMA Fire Rescue Advisory',
        },
        'fire-c4b-break-glass-shout': {
          label:
            'Kursi se khidki ka kanch poora tod dein aur bahar jhank kar logo par chillayein.',
          consequenceText:
            'Kanch tootne se tezz hawa ka flow banta hai jo corridor ka dhuan kamre ke andar kheench leta hai, aur kanch neeche gir kar khatra banata hai.',
          insight:
            'Khidki ka kanch bina zaroorat na todein. Khidki khulne se banta air draft aag aur dhuein ko kamre ke andar kheench leta hai.',
          insightSource: 'NDMA Residential Fire Guidance',
        },
      },
    },

    'fire-d5-evacuate-ground': {
      situationText:
        'Aap building ke ground floor se bahar nikal aate hain. Oopar ki balconies se dhuan nikal raha hai aur kanch ke tukde gir rahe hain. Main gate ke paas bheed khadi hai.',
      contextHint: 'Girte hue malbe aur kanch se building ke perimeter ko turant khali karein.',
      choices: {
        'fire-c5-clear-perimeter': {
          label:
            'Building se turant door road ke doosri taraf khule assembly ground mein jayein, jahan koi cheez girne ka khatra na ho.',
          consequenceText:
            'Aap sadak paar karke khule lawn mein chale jate hain. Kuch hi pal mein 4th floor ka toota hua kanch usi raste par girta hai jahan se aap nikle the.',
          insight:
            'Aag lage building se nikalte hi door khule maidan mein jayein. Girte hue kanch aur AC units niche khade logon ko bhari chot pahunchate hain.',
          insightSource: 'NDMA Evacuation Safety Standards',
        },
        'fire-c5-linger-entrance': {
          label:
            'Main darwaze ke theek bahar khade ho kar apni jeb mein car keys aur saman dhoondhein.',
          consequenceText:
            'Girte hue kanch ka ek tukda aapke paas aakar girta hai. Emergency team aapko daud kar peeche hatati hai taaki fire hose ka rasta khula rahe.',
          insight:
            'Building entrance par kabhi na rukein. Yeh jagah emergency personnel aur baki bachne walo ke aane-jaane ke liye poori tarah khali honi chahiye.',
          insightSource: 'NDMA Fire Response Guidelines',
        },
        'fire-c5-reenter-belongings': {
          label:
            'Ground floor ke mailbox mein rakhe zaroori documents lene ke liye wapas lobby mein ghusein.',
          consequenceText:
            'Lobby mein ghuste hi garm kaala dhuan aapko gher leta hai. Ek firefighter aapka haath pakad kar sakhti se bahar kheenchta hai.',
          insight:
            'Jalti hui building mein kisi bhi cheez ke liye wapas na jayein. Maal-o-asbab dobara mil sakta hai, par zindagi nahi.',
          insightSource: 'NDMA Life-Safety Rules',
        },
      },
    },

    'fire-d6-emergency-call': {
      situationText:
        'Aap surakshit perimeter par hain. Fire tenders raste mein hain par confirm nahi hai. Aap emergency call karne ke liye phone nikalte hain.',
      contextHint: 'Sahi aur clear jankari se emergency response tez hoti hai.',
      choices: {
        'fire-c6-call-112-structured': {
          label:
            '112 ERSS par call karein aur building ka poora pata, aag ki floor, phanse hue logon ki jankari aur paas ka landmark saaf batayein.',
          consequenceText:
            '112 dispatcher ne exact location note karke aane wali fire team ko phanse hue logon ki exact floor inform kardi.',
          insight:
            '112 ERSS par call karte waqt building ka pata, landmark, floor aur phanse hue logon ki sankhya saaf batayein taaki team seedhi wahan pahunche.',
          insightSource: '112 ERSS Emergency Protocol',
        },
        'fire-c6-post-social-media': {
          label:
            'Social media par video live karke aag dikhayein aur logon se puchein ki kya kisi ne fire brigade ko phone kiya hai.',
          consequenceText:
            'Live streaming mein keemti waqt barbad hota hai aur log sochte hain ki kisi aur ne phone kar diya hoga, jisse response mein der ho jaati hai.',
          insight:
            'Sankat ke waqt social media par bharosa na karein. Seedhe 112 par call karna hi official emergency dispatch ka ekmatra pakka tarika hai.',
          insightSource: 'NDMA & 112 ERSS Advisory',
        },
      },
    },

    'fire-d7-assembly-accountability': {
      situationText:
        'Teen fire tenders site par pahunch chuki hain aur hose lines bichha rahi hain. Gate ke paas Incident Commander apna control post bana rahe hain.',
      contextHint: 'Roll-call aur reporting se rescue team ko pata chalta hai kaun phansa hai.',
      choices: {
        'fire-c7-report-commander': {
          label:
            'Incident Commander ke paas ja kar apna naam aur flat number confirm karein aur batayein ki aapke floor par kaun phansa ho sakta hai.',
          consequenceText:
            'Aapki sahi report se search-and-rescue team ko pata chal gaya ki kin flats mein log ho sakte hain, jisse seedha wahan rescue shuru hua.',
          insight:
            'Assembly area par emergency team ko turant report karein. Phanse hue logo ki jankari dene se rescue operations seedhe un tak pahunchte hain.',
          insightSource: 'NDMA Emergency Management Standard',
        },
        'fire-c7-wander-off': {
          label:
            'Bina kisi ko bataye assembly area chhod kar sadak ke kone par chai peene chale jayein.',
          consequenceText:
            'Resident list mein aapka naam na milne par firefighters aapko dhoondhne ke liye wapas khatarnak building mein ghuste hain, jisse unki jaan jokhim mein padti hai.',
          insight:
            'Assembly point par jab tak headcount na ho tab tak wahan se na hatein. Gair-hazir rehne par rescue team aapko dhoondhne mein zaroori samay barbad karti hai.',
          insightSource: 'NDMA Incident Command Guidelines',
        },
      },
    },

    'fire-outcome-node': {
      narrativeText:
        'Aap structure fire se surakshit bahar nikal aaye hain aur assembly area par emergency team ko ahem jankari di hai. 112 ERSS fire units ne aag par kabu pa liya hai aur building ko secure kar diya hai.',
    },
  },
};

export const FIRE_HINGLISH_TAKEAWAYS: string[] = [
  'DARWAZA KHOLNE SE PEHLE HEAT TEST KAREIN: Darwaze aur knob ko hamesha haath ke pichle hisse (back of hand) se chhoo kar check karein. Garm darwaze ka matlab doosri taraf bhayanak aag aur superheated gases hain.',
  'DHUAN MEIN NEECHE JHUK KAR RENG-KAR CHALEIN (CRAWL LOW): Zehreela aur garm dhuan ceiling ki taraf uthta hai. Saaf aur saans lene yogya hawa floor se 30 se 60 cm ke daayre mein rehti hai.',
  'PHANS JAYEIN TOH KAMRA SEAL KAREIN: Agar bahar nikalne ka rasta band ho, toh darwaza band karein, neeche geele kapde (damp cloth) se dhuan rokein, aur khidki se flashlight ya chamkile kapde se ishara karein.',
  'LIFT KA ISTEMAL KABHI NA KAREIN: Aag ke dauran bijli cut hone par lift beech mein phas sakti hai, aur lift shafts aag aur dhuan ke liye chimney ki tarah kaam karte hain.',
  '112 ERSS KO SAHI JANKARI DEIN: Emergency call par turant exact address, kis floor par aag lagi hai, kitne log phanse hain, aur paas ke landmarks ki saaf jankari dein.',
];