// src/i18n/earthquake.ts
// Natural Roman Hinglish localization for Earthquake scenario.

import type { LocalizedScenarioData } from './types';

export const earthquakeHinglish: LocalizedScenarioData = {
  title: 'Urban Bhukamp Sankat',
  subtitle: '4th Floor Apartment — Dopahar 11:47 AM',
  nodes: {
    'eq-d1-shake': {
      situationText:
        '11:47 AM. Aapke neeche ka floor achanak zoron se hilne lagta hai. Khidki ke kanch tezi se khadkhada rahe hain aur ceiling se plaster ki dhool gir rahi hai. Ek bhari lakdi ki cupboard jhukne lagti hai aur jhatke tezi se badh rahe hain.',
      contextHint: 'Bhari jhatke shuru ho chuke hain. Turant drop, cover, aur hold on karein.',
      choices: {
        'eq-c1-drop-cover': {
          label:
            'Apne ghutno par baith jayein, majboot lakdi ki table ke neeche cover lein, aur uske paaye (legs) ko majbooti se pakad kar rakhein.',
          consequenceText:
            'Aap majboot table ke neeche chale jate hain aur uske paaye pakad lete hain. Kuch hi pal mein ceiling lamp aur frame table ke upar girte hain par aap surakshit rehte hain.',
          insight:
            'NDMA Drop, Cover, aur Hold On niyam: Ghutno par baithkar girne se bachein, majboot furniture ke neeche sar aur shareer ko cover karein, aur jab tak jhatke band na hon tab tak pakde rakhein.',
          insightSource: 'NDMA Earthquake Safety Guidelines',
        },
        'eq-c1-run-stairs': {
          label:
            'Turant main darwaze se bahar bhagkar building ki seedhiyon (stairs) ki taraf daudein.',
          consequenceText:
            'Jaise hi aap darwaze ki taraf daudte hain, ek tezz jhatka aapko chaukhat par de maarta hai. Girte hue plaster aur kanch ke tukde aapke hath ko chhil dete hain aur chot aati hai.',
          insight:
            'NDMA guidelines ke anusar bhukamp ke dauran bahar ya seedhiyon par kabhi na daudein. Girte hue kanch, bricks aur malba daudte hue logon ko sabse zyada chot pahunchate hain.',
          insightSource: 'NDMA Earthquake Safety Guidelines',
        },
        'eq-c1-stand-doorway': {
          label:
            'Paas ke darwaze (doorway) ke beech mein khade ho jayein aur chaukhat ko pakad lein.',
          consequenceText:
            'Darwaze ke paas koi overhead suraksha nahi milti. Kholta-band hota darwaza jhatke mein aapke hath par lagta hai aur plaster ki dhool aakho mein padti hai.',
          insight:
            'Modern buildings mein darwaze deewaron se zyada majboot nahi hote aur udhar swinging door aur girte malbe ka khatra rehta hai. Majboot furniture ke neeche cover lena behad surakshit hai.',
          insightSource: 'NDMA Earthquake Preparedness Advice',
        },
      },
    },

    'eq-d2-gas-hazard': {
      situationText:
        'Kareeb 45 seconds baad mukhya jhatka tham jata hai. Kamre mein toote hue kanch aur samaan bikhre hain. Achanak sannate mein aapko kitchen se LPG cooking gas ke leak hone ki tezz badboo aati hai aur fridge cable se halki chingari dikhti hai.',
      contextHint: 'Bhukamp ke baad LPG gas leak aur electrical short-circuit aag lagne ka sabse bada khatra hote hain.',
      choices: {
        'eq-c2-gas-power-off': {
          label:
            'Dhyan se kitchen mein jayein, LPG cylinder ka regulator valve band karein, aur main electrical MCB breaker off karein.',
          consequenceText:
            'Aap turant LPG cylinder ke knob ko OFF karte hain aur entrance panel se main MCB switch gira dete hain. Isse aag aur explosion ka turant khatra taal jata hai.',
          insight:
            'Jhatke rukte hi gas cylinder ka regulator aur bijli ka main switch band karna post-earthquake aag aur dhmake se bachata hai.',
          insightSource: 'NDMA Fire & Disaster Safety Guidelines',
        },
        'eq-c2-light-switch': {
          label:
            'Kitchen ka light switch on karein taaki dekh sakein ki gas pipe kahan se leak ho raha hai.',
          consequenceText:
            'Jaise hi aap switch click karte hain, ek choti electrical chingari se phaili hui LPG gas mein aag ka gola bhadak jata hai! Aap piche hatate hain aur chot aane se bal-bal bachte hain.',
          insight:
            'Gas leak ki sthiti mein kabhi bhi light switch, machis ya aag ka prayog na karein. Koi bhi electrical chingari gas ko aag pakda sakti hai.',
          insightSource: 'NDMA & 112 ERSS Fire Safety Guidance',
        },
        'eq-c2-ignore-flee': {
          label:
            'Badboo ko nazarandaz karein aur turant flat ka darwaza khol kar corridor mein bhaag jayein.',
          consequenceText:
            'Aap gas leak ko piche chhodkar bhaag jate hain. Yeh bandh flat mein ek bada khatra ban jata hai jo doosre padosiyon aur rescue workers ke liye janleva ho sakta hai.',
          insight:
            'Evacuation se pehle gas aur bijli band karne ke liye 15 seconds lena poori building ko aag se bachane mein madad karta hai.',
          insightSource: 'NDMA Household Emergency Planning',
        },
      },
    },

    'eq-d2b-injured-hazard': {
      situationText:
        'Girte kanch se aapke hath par chot aayi hai aur khoon nikal raha hai. Dhool aakho mein chubhti hai. Jhatke thame hain par kitchen se LPG gas leak ki tezz badboo aa rahi hai.',
      contextHint: 'Khoon rokne ke sath-sath dhyan rakhein ki piche aag lagne ka khatra na chhoote.',
      choices: {
        'eq-c2b-firstaid-gas': {
          label:
            'Ek saaf kapde se hath ke cut par dabav dalein, phir turant gas cylinder regulator aur bijli ka main MCB band karein.',
          consequenceText:
            'Direct pressure se bleeding kam hoti hai. Shant reh kar aap gas cylinder switch aur main bijli panel band karte hain aur zaroori samaan lekar darwaze ki taraf badhte hain.',
          insight:
            'Prathmik upchar: Saaf kapde se dabav daal kar pehle bleeding rokein, aur nikalne se pehle gas/bijli ke mukhya khatron ko band karein.',
          insightSource: 'NDMA & First Aid Principles',
        },
        'eq-c2b-panic-flee': {
          label:
            'Chhot lage hath ko pakad kar ghabrahat mein seedhe corridor ki taraf bhaag jayein.',
          consequenceText:
            'Ghabrahat mein aap bina kisi patti ya upchar ke bhaagte hain aur piche gas leak chhod aate hain, jisse raste mein takleef badhti hai.',
          insight:
            'Ghabrahat aur hadbadi mein zaroori safety kadam chhoot jate hain. Khud ko shaant rakhna naye sankat ko rokta hai.',
          insightSource: 'NDMA Community Safety Guidelines',
        },
      },
    },

    'eq-d3-evac-route': {
      situationText:
        'Aap 4th floor ke passage mein aate hain. Padosi aawazein de rahe hain aur siren sunayi de rahe hain. Deewaron par daraarein dikh rahi hain. Aapko neeche ground floor par jaana hai.',
      contextHint: 'Seedhiyan khuli hain aur passenger lift ka display bhi on dikh raha hai.',
      choices: {
        'eq-c3-stairwell': {
          label:
            'Emergency fire staircase ki taraf jayein, handrail pakdein aur shanti se lagatar neeche utarein.',
          consequenceText:
            'Aap seedhiyon ka prayog karte hain, dahini taraf rehte hue railing pakadte hain. Lagatar aur dhyan se chalne se bheed ya phisalne ka khatra taal jata hai.',
          insight:
            'Evacuation ke waqt hamesha seedhiyon ka hi prayog karein. Railing pakad kar dhyan se utarein taaki girne ya bheed mein dabne se bachein.',
          insightSource: 'NDMA High-Rise Evacuation Guidelines',
        },
        'eq-c3-elevator': {
          label:
            'Lift ka darwaza khula hai; do padosiyon ke sath lift mein baithein taaki seconds mein neeche pahunch sakein.',
          consequenceText:
            'Aap lift mein baithte hain. Do floor neeche aate hi bijli supply trip ho jati hai! Lift jhatke ke sath do floor ke beech andhere mein atak jati hai.',
          insight:
            'Bhukamp ke waqt ya uske baad lift ka prayog KABHI NA KAREIN. Bijli cut hone ya guide rail tedhi hone se lift beech mein phas jati hai.',
          insightSource: 'NDMA Earthquake Safety Guidelines',
        },
        'eq-c3-balcony': {
          label:
            'Corridor ki balcony par jayein taaki neeche dekh kar rescue team ko aawaz de sakein.',
          consequenceText:
            'Jaise hi aap balcony par kadam rakhte hain, slab ke neeche se chatakne ki aawaz aati hai. Balcony ke joint par daraarein dekh kar aap turant piche hatate hain.',
          insight:
            'Balcony aur bahar nikle hisse bhukamp mein sabse pehle kamzor padte hain. Bhukamp ke baad balcony par ikattha na hon.',
          insightSource: 'General Structural Safety Principles',
        },
      },
    },

    'eq-d3b-elevator-trap': {
      situationText:
        'Aap andhere mein ruki hui lift ke andar phanse hain. Grille se halki dhool aa rahi hai. Ek padosi ghabra raha hai aur halka jhatka mehsoos hota hai.',
      contextHint: 'Shant rahein aur bina madad ke lift shaft mein koodne ki galti na karein.',
      choices: {
        'eq-c3b-alarm-call': {
          label:
            'Phone ki flashlight on karein, emergency alarm button dabayein aur 2nd floor landing par logon ko aawaz dein.',
          consequenceText:
            'Building ke guard aur padosi alarm sun lete hain. 2nd floor se landing door khol kar woh sabhi logon ko bahar nikalte hain.',
          insight:
            'Lift mein phasne par shaant rahein, alarm ya phone se bahar ke logon ko soochit karein aur trained sahayata ka intezar karein.',
          insightSource: 'General Emergency Preparedness Guidance',
        },
        'eq-c3b-force-drop': {
          label:
            'Hathon se andar ka darwaza kholein aur neeche shaft ke gap mein koodne ki koshish karein.',
          consequenceText:
            'Darwaza kholne par neeche gehri khai aur cables dikhte hain. Koodne ke chakkar mein pair phisalta hai aur chot aate aate bachti hai.',
          insight:
            'Lift shaft mein bina kisi rescue team ke nikalne ki koshish janleva girne ka karan ban sakti hai.',
          insightSource: 'General Emergency Preparedness Guidance',
        },
      },
    },

    'eq-d4-aftershock': {
      situationText:
        'Aap 2nd floor landing par hain tabhi ek bhayanak aawaz ke sath AFTERSHOCK (doosra jhatka) aata hai! Concrete seedhiyan zor se hilne lagti hain aur deewar se plaster girta hai.',
      contextHint: 'Zameen phir hil rahi hai. Khud ko bachane ke liye turant faisla lein.',
      choices: {
        'eq-c4-crouch-interior': {
          label:
            'Landing par andar ki pakki deewar ke paas jhuk kar baith jayein, sar aur gardan ko hathon se dhak lein.',
          consequenceText:
            'Aap deewar ke paas simat kar baith jate hain aur sar ko cover kar lete hain. Girte hue plaster ke tukde aapke hath par lagte hain par sar surakshit rehta hai.',
          insight:
            'Seedhiyon par aftershock aane par turant landing par deewar ke paas jhuk jayein, sar/gardan ko cover karein aur jhatke rukne ka intezar karein.',
          insightSource: 'NDMA Earthquake Safety Guidelines',
        },
        'eq-c4-stampede': {
          label:
            'Ghabra kar tezi se baaki bachi seedhiyon par neeche ki taraf daudein.',
          consequenceText:
            'Hilti hui seedhiyon par pair phisal jata hai. Aap kai seedhiyan neeche girte hain, pair mein moch aati hai aur ghutna chhil jata hai.',
          insight:
            'Jhatke ke dauran seedhiyon par daudna fractures aur stampede (bheed mein dabne) ka mukhya karan banta hai.',
          insightSource: 'NDMA Earthquake Safety Guidelines',
        },
        'eq-c4-clutch-railing': {
          label:
            'Seedhe khade rahein aur metal stair railing ko dono hathon se kas kar pakad lein.',
          consequenceText:
            'Jhatke se railing ke anchors concrete se dheele pad jate hain. Railing jhukne lagti hai aur aapka balance bigad jata hai.',
          insight:
            'Railing seismic jhatkon mein alag ho sakti hai. Andar ki solid deewar ke paas jhukna behtar santulan deta hai.',
          insightSource: 'NDMA Earthquake Safety Guidelines',
        },
      },
    },

    'eq-d5-street-hazard': {
      situationText:
        'Aap lobby se bahar residential complex ke aangan mein aate hain. Ghabraye hue log building ki balconies aur AC units ke theek neeche khade hain. Bijli ke taar upar jhul rahe hain.',
      contextHint: 'Building ke theek bahar ka hissa girte kanch aur malbe ke karan sabse khatarnak hota hai.',
      choices: {
        'eq-c5-open-ground': {
          label:
            'Tezi se building, kanch ki deewaron aur bijli ke taaron se door khule community park ki taraf jayein.',
          consequenceText:
            'Aap khule ghaas ke maidan mein pahunchte hain. Kuch hi der mein upar se toota kanch aur AC panel usi raste par girte hain jahan log khade the. Aap surakshit hain.',
          insight:
            'Girte hue kanch aur bricks building ke bahar khade logon ke liye sabse bada khatra hote hain. Hamesha khule maidan mein jayein.',
          insightSource: 'NDMA Earthquake Safety Guidelines & SACHET Portal',
        },
        'eq-c5-under-porch': {
          label:
            'Dhool aur dhoop se bachne ke liye building ke entrance porch ki glass canopy ke neeche khade rahein.',
          consequenceText:
            'Upar se gira malba canopy ke kanch par girta hai, jisse kanch toot kar neeche bikhar jata hai aur aap chotil hote hain.',
          insight:
            'Entrance canopies aur chhajje aftershocks ke dauran tootte hain. Building ki perimeter se poori tarah door rahein.',
          insightSource: 'NDMA Community Safety Guidelines',
        },
        'eq-c5-reenter-valuables': {
          label:
            'Yaad aaye ki wallet aur ghar ki chabi andar reh gayi hai; turant unhe lene ke liye wapas building mein daudein.',
          consequenceText:
            'Ek volunteer aapko rokte hue chilata hai. Theek usi waqt darwaze ke upar ki concrete lintel toot kar theek usi raste par girti hai.',
          insight:
            'Samaan ke liye damage hui building mein KABHI WAPAS NA JAYEIN. Aftershocks kamzor building ko achanak gira sakte hain.',
          insightSource: 'NDMA Earthquake Safety Guidelines',
        },
      },
    },

    'eq-d6-post-comms': {
      situationText:
        'Aap padosiyon ke sath khule park mein surakshit hain. Mobile network jam ho gaya hai aur call drop ho rahe hain. Door se emergency sirens sunayi de rahe hain. Ek padosi poochta hai ki parivaar ko kaise khabar karein.',
      contextHint: 'Aapda ke waqt mobile networks ka zimmewari se prayog karein.',
      choices: {
        'eq-c6-sms-sachet-112': {
          label:
            'Parivaar ko chota SMS text message bhejein, SACHET portal par alerts dekhein, aur 112 sirf jaanleva sankat ke liye bachayein.',
          consequenceText:
            'Aapka SMS turant deliver ho jata hai. Voice call network par load na dalne se ambulance aur rescue teams asani se coordinate kar paati hain.',
          insight:
            'Disaster ke waqt voice calls se network turant jam hota hai. SMS ya messaging ka prayog karein, SACHET check karein, aur 112 sirf urgent emergency ke liye dial karein.',
          insightSource: 'Government of India 112 ERSS & NDMA Advisory',
        },
        'eq-c6-spam-voice-calls': {
          label:
            'Baar-baar lagatar sabhi rishtedaron ko voice call redial karte rahein.',
          consequenceText:
            'Har call busy signal ke sath cut jati hai. 20 minute mein aapke phone ki battery khatam ho jati hai aur zaroori alerts aane band ho jate hain.',
          insight:
            'Baar-baar call karne se phone battery khatam hoti hai aur emergency network traffic badhta hai.',
          insightSource: '112 ERSS Advisory',
        },
        'eq-c6-forward-rumours': {
          label:
            'Social media par aayi aisi audio clip forward karein jisme likha ho ki theek aadhe ghante baad ek aur bhari bhukamp aane wala hai.',
          consequenceText:
            'Is afwah se park mein achanak bhag-daud mach jati hai, jisse kai buzurg girte hain aur aati hui emergency ambulance ka rasta rukta hai.',
          insight:
            'Bhukamp ki pehle se exact time par bhavishyavani nahi ki ja sakti. Sirf NDMA aur official bulletins par vishwas karein aur afwahein na phailayein.',
          insightSource: 'NDMA Citizen Advisory',
        },
      },
    },

    'eq-outcome-node': {
      narrativeText:
        'Aap surakshit khule maidan mein pahunch gaye hain. Local 112 units aur disaster management team ne area ko cordon off kar diya hai. Aapke shaant aur sahi faislon ne aapko aur doosron ko bade sankat se bachaya.',
    },
  },
};