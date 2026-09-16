// src/i18n/historicalBhuj.ts
// Natural Roman Hinglish localization for 2001 Bhuj Earthquake Historical Simulation.
// Grounded in NDMA India, IMD, GSDMA, and NIDM verified post-earthquake documentation.

import type { LocalizedScenarioData } from './types';

export const historicalBhujHinglish: LocalizedScenarioData = {
  title: 'Bhuj 2001 Bhookamp — Itihaasik Sankat',
  subtitle: 'Kutch Zila, Gujarat · 26 January 2001 · Subah 08:46 Baje',
  historicalMeta: {
    eventTitle: '2001 Gujarat (Bhuj) Bhookamp',
    location: 'Kutch Zila, Gujarat, Bharat',
    date: '26 January 2001',
    historicalContext:
      'Republic Day 2001 ki subah lagbhag 08:46 baje, Gujarat ke Kutch ilaaqe mein bhishan bhookamp aaya (IMD ke anusaar 6.9 Richter / USGS ke anusaar 7.7 Mw). Bhuj, Bhachau aur Anjar jaise shehar buri tarah prabhavit hue aur lakho bina-reinforcement wale pathar ke makan dhas gaye. Is rashtriya sankat ne Bharat ke disaster management framework ko poori tarah badal diya, jisse aage chal kar GSDMA aur National Disaster Management Authority (NDMA) ka gathan hua.',
    disclaimer:
      'SHIKSHAPRAD RECONSTRUCTION: Yeh simulation pramanik itihaasik jaankari par aadharit ek shikshaprad punarnirman hai. Patra, imarat, baatcheet aur nirnay lene ka kram simulation ke niyam hain aur kisi niji vyakti ke anubhav ka re-creation nahi hain.',
  },
  nodes: {
    // NODE 1: Initial Seismic Shock (Timed: 15s)
    'bhj-d1-morning-shock': {
      situationText:
        '26 January 2001 · Subah 08:46 baje. Aap Bhuj ke baahar bane ek traditional do-manzila pathar aur eent ke pakke ghar ke ground floor par hain. Republic Day ka radio chal raha hai jab achanak zameen bhishan roop se kaanpne lagti hai. Deewaron par lambe tirchhe cracks padte hain, chuna aur plaster jhadne lagta hai, aur chhat ki bhari mitti ki tiles neeche girne lagti hain.',
      contextHint: 'Bina reinforcement wali pathar ki deewarein tezz jhatkon se toot kar girne ki sthiti mein hain.',
      choices: {
        'bhj-c1-table-shelter': {
          label:
            'Turant kisi bhari lakdi ke solid dining table ke neeche ghusein, gardan par dono haath kas kar rakhein, aur table ke paye majbooti se pakad lein.',
          consequenceText:
            'Aap bhari table ke neeche ghus jaate hain. Agle hi pal chhat ka plaster aur pathar table ke upar aakar girte hain par solid lakdi unhe baha le jaati hai. Lagbhag 90 second tak chalne wale bhishan jhatkon ke dauran aapka sir aur rehad ki haddi surakshit rehti hai.',
          insight:
            'NDMA Drop, Cover, and Hold On protocol batata hai ki majboot furniture ke neeche chhipna sabse surakshit hai. Bhookamp ke waqt deewaron aur chhat se girte malbe se bachne ke liye bhaagne ki bajaye fauran cover lena chahiye.',
          insightSource: 'NDMA Earthquake Safety Guidelines & EERI 2001 Report',
        },
        'bhj-c1-bolt-outside': {
          label:
            'Deewarein girne se pehle baahar gali mein nikalne ke liye main darwaze ki taraf daud padein.',
          consequenceText:
            'Zameen ke tezz jhatkon se aap darwaze ki dehleez par ghutno ke bal gir jaate hain. Tabhi upar ki chhat ka pathar ka chhajja aur parapet toot kar seedhiyon par girta hai, jisse pathar ke tukde aapke sir aur kandhe par lagte hain.',
          insight:
            'Bhookamp ke dauran ghar se baahar daudna pathar ki imaraton mein chot ka sabse bada kaaran banta hai. Chhat ke chhajje aur parapet theek darwaze aur deewar ke kinaare girte hain.',
          insightSource: 'NDMA Earthquake Safety Protocol',
        },
        'bhj-c1-stand-doorframe': {
          label:
            'Bina kisi sahare ke kamre ke darwaze ke frame ke beech seedhe khade hokar jhatke rukne ka intezar karein.',
          consequenceText:
            'Pathar ki deewaron ke tedhe hone se door frame ghoom jata hai. Hawa mein jhulata darwaza tezi se aapke haath par lagta hai aur upar se jhadta plaster sir par chot pahunchata hai.',
          insight:
            'Traditional pathar ke purane makano mein door frames majboot nahi hote aur deewar ke hilne par unka sahara toot jata hai. Darwaze mein khade hone ki jagah majboot mez ke neeche chhipna chahiye.',
          insightSource: 'NDMA & NIDM Structural Earthquake Advisory',
        },
      },
    },

    // NODE 2A: Damaged Structure Triage
    'bhj-d2-masonry-triage': {
      situationText:
        'Pehla bada jhatka tham jata hai. Poore kamre mein safed chune ki dhool chhayi hai aur door se logon ki cheekhein sunai de rahi hain. Table ke neeche se nikal kar aap dekhte hain ki baahar ki dono mukhya pathar ki deewaron par bade "X" shape ke cracks pad chuke hain aur chhat ki lakdi ki kadiyan jhuk gayi hain.',
      contextHint: 'Cracks aane ke baad pathar ke ghar shuruati aftershocks (halke jhatkon) mein bhi dhas sakte hain.',
      choices: {
        'bhj-c2-evacuate-now': {
          label:
            'Bina kisi samaan ki chinta kiye, pichhle aangan ke khule darwaze se fauran baahar khuli zameen par nikal jayein.',
          consequenceText:
            'Aap fauran aangan mein nikal aate hain. Do hi minute mein ek tezz aftershock aata hai, aur jis kamre ki deewar par crack tha, uska upari hissa andar ki taraf dhas jata hai.',
          insight:
            'Bhuj bhookamp ke survey saabit karte hain ki dararon wale purane makan pehle hi aftershock mein gir jaate hain. Jaan bachane ke liye bina samay gawaye khuli jagah nikalna zaroori hai.',
          insightSource: 'GSDMA & EERI Gujarat Earthquake Reconnaissance',
        },
        'bhj-c2-gather-valuables': {
          label:
            'Baahar nikalne se pehle almari mein rakhe paise, gehne aur zameen ke kagaz ikattha karne ke liye bedroom mein jayein.',
          consequenceText:
            'Jab aap kagaz dhoond rahe hote hain, tabhi ek halka aftershock deewar ko hila deta hai. Bhari almari bed par gir jaati hai aur kamre mein dhool bharne se aap fans jaate hain.',
          insight:
            'Nuksan-grast imarat se samaan nikaalne ke chakkar mein kabhi der na karein. Kamzor ho chuki imarat chote se jhatke se bhi dhas sakti hai.',
          insightSource: 'NDMA Post-Earthquake Safety Principles',
        },
      },
    },

    // NODE 2B: Injured Evacuation
    'bhj-d2b-injured-evacuation': {
      situationText:
        'Chhajje ke pathar se sir par aayi chot aur kandhe ke dard ko sambhalte hue aap dhool ke beech khade hote hain. Deewarein tezi se crack ho chuki hain aur gali mein padosi ghabra kar cheekh rahe hain.',
      contextHint: 'Khoon behna rokein aur kamzor deewar ke saaye se turant baahar niklein.',
      choices: {
        'bhj-c2b-press-wound-exit': {
          label:
            'Saaf sooti rumaal ko sir ke ghaav par kas kar dabaayein, padosi ko sahara dekar gali ke beech se bade chowk ki taraf badhein.',
          consequenceText:
            'Rumaal dabane se khoon behna ruk jata hai. Padosi ke sath milkar aap jhuk rahi deewaron se door hokar chaudi sadak tak surakshit pahunchte hain.',
          insight:
            'Ghaav par direct pressure lagakar khoon rokein aur hosh sambhalte hue tooti imaraton se door khuli jagah ki taraf nikalna hi sahi tarika hai.',
          insightSource: 'NDMA Emergency First Aid & Triage Guidelines',
        },
        'bhj-c2b-sit-doorstep': {
          label:
            'Dehleez par baith kar aaram karein aur kisi ambulance ya relief gaadi ke aane ka intezar karein.',
          consequenceText:
            'Do-manzila deewar ke theek neeche baithna behad khatarnak saabit hota hai. Chhat se bachi hui tiles girne lagti hain aur ilaake ke saare phone lines band ho chuki hain.',
          insight:
            'Damaged deewaron ke theek neeche kabhi intezar na karein. Bade bhookamp mein rescue services ke aane mein waqt lag sakta hai, isliye khule maidan mein jana zaroori hai.',
          insightSource: 'NDMA Disaster Management Advisory',
        },
      },
    },

    // NODE 3: Narrow Street Debris (Timed: 15s)
    'bhj-d3-narrow-street-debris': {
      situationText:
        'Aap maidan ki taraf jane wali mukhya gali mein aate hain. Gali sirf 4 meter chaudi hai aur dono taraf purane do-manzila pathar ke makan hain. Raste par malba phaila hai aur upar latak rahe pathar ke chhajje aur railing raste ki taraf jhuke hue hain.',
      contextHint: 'Overhead drop zone: Deewaron ke bilkul kinaare chalne se bachein.',
      choices: {
        'bhj-c3-centerline-protect': {
          label:
            'Gali ke bilkul beechon-beech chalein, sir par mota kambal ya bag rakh kar cover banayein, aur tezi se chowk ki taraf badhein.',
          consequenceText:
            'Gali ke beech mein rehne se aap makanon ke theek neeche girne wale malbe se bach jaate hain. Bag se sir cover karne ke kaaran girte chote patharon se bhi suraksha milti hai.',
          insight:
            'Tang galiyon mein raste ke center mein chalna aur sir ko bag ya moti cheez se dhakna girte hue chhajjon aur eenton se bachaata hai.',
          insightSource: 'NDMA Urban Earthquake Safety Protocol',
        },
        'bhj-c3-hug-walls': {
          label:
            'Deewar ke theek neeche chipak kar chalein, yeh soch kar ki upar ka chhajja aapko chhat ki tarah bacha lega.',
          consequenceText:
            'Thodi aage ka ek purana pathar ka chhajja achanak toot kar theek deewar ke kinaare girta hai, jahan aap chal rahe the.',
          insight:
            'Chhajje aur balconies bhookamp ke baad sabse pehle girte hain. Deewar ke kinaare chalne se insan seedhe malbe ke neeche aa jata hai.',
          insightSource: 'EERI Gujarat Reconnaissance & NDMA Guidelines',
        },
      },
    },

    // NODE 4: Secondary Utility Hazards
    'bhj-d4-utility-secondary': {
      situationText:
        'Gali ke mod par bijli ka transformer pole toot kar gira hai aur toote hue taar sadak ke paani par bikhre hain. Pass mein ek toote hue chai ke thele se domestic LPG cylinder ki tezz gas leak hone ki badboo aa rahi hai.',
      contextHint: 'Toote bijli ke taar aur LPG gas leak bhookamp ke baad badi aag (secondary fire) ka sabse ahem kaaran bante hain.',
      choices: {
        'bhj-c4-isolate-warn': {
          label:
            'Sabhi ko taaron ke paas jane se rokein, logon ko aag ya matchstick na jalane ki chetavani dein, aur ghoom kar maidan ki taraf chalein.',
          consequenceText:
            'Aapke saavdhan karne se do gaon wale current ke paani mein pair rakhne se bach jaate hain aur koi bidi ya machis nahi jalata, jisse aag ka bada hadsa tal jata hai.',
          insight:
            'Bhookamp ke baad gire hue taaron ko hamesha live maanein aur gas leak ke paas machis ya spark se parhez karein taaki aag lagne se bacha ja sake.',
          insightSource: 'NDMA Earthquake Secondary Hazard Protocols',
        },
        'bhj-c4-step-over-cables': {
          label:
            'Yeh soch kar ki bijli chali gayi hai, taaron ke upar se nikal jayein aur cylinder dekhne ke liye lighter jalayein.',
          consequenceText:
            'LPG gas ke badhte dabav ke beech lighter jalate hi achanak tezz aag ka gola bhadakta hai, jisse log ghabra kar bhaagne lagte hain.',
          insight:
            'Bhookamp ke baad gire taaron aur gas leaks ke paas open flame jalana jaanleva blast ka kaaran ban sakta hai.',
          insightSource: 'NDMA Fire & Gas Safety Guidelines',
        },
      },
    },

    // NODE 5: Aftershock on Open Ground (Timed: 15s)
    'bhj-d5-aftershock-open-ground': {
      situationText:
        'Aap deewaron aur bijli ke taaron se door shehar ke bade khule maidan mein pahunchte hain. Yahan saikadon log jama hain. Achanak zameen dobara gungunati hai—ek tezz 5+ magnitude ka aftershock zameen ko hilata hai. Dar ke maare kuch log wapas apne gharon ki taraf daudne lagte hain.',
      contextHint: 'Khule maidan mein aftershock aane par zameen par baith kar balance banayein aur logon ko deewaron ke paas jane se rokein.',
      choices: {
        'bhj-c5-drop-open-calm': {
          label:
            'Khuli mitti par ghutno ke bal baith jayein, sir ko cover karein, aur zor se chilla kar sabhi ko khule mein hi rehne ko kahein.',
          consequenceText:
            'Zameen par baithne se balance nahi bigadta. Maidan ke kinaare bani do pehle se kamzor compound deewarein gir jaati hain, par beech mein baithe log poori tarah surakshit rehte hain.',
          insight:
            'Bade bhookamp ke baad tezz aftershocks aate hain. Khuli zameen par neeche baithna aur imaraton ki deewaron se door rehna hi bachaav hai.',
          insightSource: 'NDMA Aftershock Preparedness Advisory',
        },
        'bhj-c5-rush-back-check': {
          label:
            'Gali ke kinaare daud kar yeh dekhne jayein ki kahin aapke rishtedaaron ka makan toh nahi gir gaya.',
          consequenceText:
            'Gali ke kinaare daudte hi ek bachi hui boundary wall bahar ki taraf girti hai, jiske eent ke tukde lagne se aapko chot aati hai.',
          insight:
            'Aftershock ke dauran kabhi bhi makanon ki taraf na daudein. Kamzor deewarein thode se jhatke se bhi gir sakti hain.',
          insightSource: 'NDMA Building Safety Protocols',
        },
      },
    },

    // NODE 6: Community Response
    'bhj-d6-community-response': {
      situationText:
        'Maidan par sankat ki badi tasveer saaf hoti hai: regional phone towers aur landlines poori tarah band hain aur sarkari imaratein bhi dhas chuki hain. Military aur state relief aane se pehle aapas mein milkar madad karna hi ekmatra rasta hai.',
      contextHint: 'Aapas mein milkar madad karein: ghayal logon ki patti karein, peene ka paani bacha kar rakhein, aur highway ki taraf khabar bhejein.',
      choices: {
        'bhj-c6-organize-aid': {
          label:
            'Community triage banayein: saaf kapde se ghaav par patti baandhein, rehad ki chot wale mareezon ko bina board ke na hilayein, aur relief teams ko rasta dikhane ke liye do logo ko main highway par bhejein.',
          consequenceText:
            'Aapki samajhdari se aath ghayal padosiyon ka khoon behna ruk jata hai, spinal injury wale log surakshit rehte hain, aur aane wali rescue teams ko seedha rasta mil jata hai.',
          insight:
            'Bade regional sankat mein jab phone aur communications thapp ho, tab disciplined community first response hi ahem jaan bachaata hai.',
          insightSource: 'NDMA Community Disaster Response Framework',
        },
        'bhj-c6-crowd-rumors': {
          label:
            'Bheed mein afwahein phailayein ki dam tootne wala hai aur dead phone par baar-baar call milate hue ghayalon ko ignore karein.',
          consequenceText:
            'Afwahon se maidan par bhadkad mach jaati hai aur zaroori samay barbad hota hai jabki ghayalon ko madad nahi mil paati.',
          insight:
            'Afwahon se bachein aur crisis ke shuruati ghanton mein aapas mein milkar first aid aur madad par dhyan dein.',
          insightSource: 'NDMA Disaster Psychology & Community Resilience',
        },
      },
    },

    // OUTCOME NODE
    'bhj-outcome-node': {
      narrativeText:
        'Aapne 2001 Bhuj bhookamp ke sankat ka safalta-poorvak saamna kiya: pathar ke makanon mein Drop/Cover/Hold ka sahi upyog kiya, tang galiyon ke drop zones se bache, aag ke khatron ko rokaa, aftershocks ke dauran khule maidan par datte rahe, aur aapas mein milkar first-aid triage banaya. Is itihaasik sankat ne hi Gujarat State Disaster Management Authority (GSDMA) aur aage chal kar National Disaster Management Authority (NDMA) ke gathan ki neev rakhi.',
    },
  },
};
