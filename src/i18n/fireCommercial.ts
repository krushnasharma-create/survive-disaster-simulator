// src/i18n/fireCommercial.ts
// Natural Roman Hinglish localization for Commercial Complex Fire Scenario.

import type { LocalizedScenarioData } from './types';

export const fireCommercialHinglish: LocalizedScenarioData = {
  title: 'Commercial Complex Aag Aur Dhuan',
  subtitle: 'Shopping Mall Food Court · Shaam 06:45',
  nodes: {
    'frc-d1-alarm-discovery': {
      situationText:
        'Shaam 06:45 baje. Aap mall ke 3rd floor food court mein hain. Emergency alarm bajta hai aur restaurant kitchen exhaust shaft se kaala dhuan nikalne lagta hai. Chilla-chilli shuru hoti hai ki kitchen deep-fryer mein aag lag gayi hai.',
      contextHint: 'Food court mein toxic grease smoke bhar raha hai. Log escalators ki taraf bhaag rahe hain.',
      choices: {
        'frc-c1-locate-fire-exit': {
          label: 'Upar illuminated green Fire Exit sign dekhein, central escalators ko chhodkar direct enclosed fire staircase ki taraf jaayein aur saathiyon ko bhi bulayein.',
          consequenceText:
            'Aapne green Fire Exit sign dekhkar 6 shoppers ko safe concrete fire staircase ke andar le liya, escalators par badhti bheed se bachte hue.',
          insight:
            'NDMA aur National Building Code ke mutabik escalators fire exit nahi hote aur dhuen ko upar kheench kar flue bana dete hain. Hamesha green fire exit stairwells ki taraf badhein.',
          insightSource: 'NDMA Commercial Building Fire Safety',
        },
        'frc-c1-central-escalator': {
          label: 'Central glass escalators ki taraf daudein taaki tezi se ground floor pahunch sakein.',
          consequenceText:
            'Fire system ne escalators ki power turant cut kardi. Band seedhiyon par bhayanak bottleneck ban gaya aur upar chadhta dhuan sabko gherne laga.',
          insight:
            'Fire alarm ke waqt escalators automatically ruk jaate hain aur chimney ki tarah dhuan kheench kar fatal choke points ban jaate hain.',
          insightSource: 'NDMA Fire Safety Guidelines',
        },
        'frc-c1-investigate-kitchen': {
          label: 'Restaurant kitchen ke paas jakar dekhein ki aag kitni badi hai aur kya fire extinguisher se bujh sakti hai.',
          consequenceText:
            'Kitchen ceiling par sudden flare-up hua. Tel aur dhuen ke gubaar ne aapke chehre par aakar aankhein band kardi aur severe coughing shuru ho gayi.',
          insight:
            'Commercial kitchen grease fires bohot tezi se explode karti hain. Civilians ko aag bujhane ke bajaye turant evacuate karna chahiye.',
          insightSource: 'NDMA Fire Service Operational Guidance',
        },
      },
    },

    'frc-d2-corridor-visibility': {
      situationText:
        'Service corridor mein halka dhuan ghus chuka hai. Upar ceiling par dhuan kaala ho raha hai, par farsh ke paas hawa saaf hai.',
      contextHint: 'Thermal layering: garam zehrila carbon monoxide chhat ke paas ikattha hota hai.',
      choices: {
        'frc-c2-crouch-walk-wall': {
          label: 'Neeche jhuk kar crouch karein, naak-muh kapde se dhankein, aur baayein deewar ko haath se chhoote hue aage badhein.',
          consequenceText:
            'Jhukne se aap poisonous smoke layer se bach gaye. Deewar ko touch karte hue aap dim emergency light mein bhatke bina fire door tak pahunch gaye.',
          insight:
            'Dhuen ki ceiling ke neeche jhuk kar chalna aur perimeter wall ko guide banana zero visibility mein orientation aur saaf hawa dono deta hai.',
          insightSource: 'NDMA Fire Evacuation Standard',
        },
        'frc-c2-walk-upright-fast': {
          label: 'Seedhe khade hokar saans rok kar tezi se aage daudne ki koshish karein.',
          consequenceText:
            'Khade hokar bhaagne se chhat ka garam dhuan fefdon mein chala gaya aur tez khansi se aap farsh par gir pade.',
          insight:
            'Bhaagte waqt saans rokna sambhav nahi hota. Sirf neeche jhuk kar hi thandi aur oxygenated hawa milti hai.',
          insightSource: 'NDMA Fire Survival Advisory',
        },
      },
    },

    'frc-d2b-atrium-crowd-triage': {
      situationText:
        'Aap band escalators ke paas phase hain. Chhat par dhuan chha chuka hai aur log andhadhundh dhakka-mukki kar rahe hain.',
      contextHint: 'Logon ko side emergency exit ki taraf modkar bheed ka funnel todein.',
      choices: {
        'frc-c2b-divert-crowd': {
          label: 'Zor se side exit ki taraf point karte hue aawaz dein: "EXIT IDHAR HAI! MERE PEECHE AAO!" aur bheed ko redirect karein.',
          consequenceText:
            'Aapki authoritative aawaz ne crowd panic ko tod diya. Kai log band escalators chhodkar aapke peeche safe service corridor mein aa gaye.',
          insight:
            'Public fires mein log panic mein ek doosre ko follow karte hain. Clear voice mein doosra exit dikhana stampede aur smoke inhalation dono se bachata hai.',
          insightSource: 'NDMA Crowd Management Guidelines',
        },
        'frc-c2b-push-escalator': {
          label: 'Escalator par bheed ko cheerte hue aage nikalne ki koshish karein.',
          consequenceText:
            'Aage koi gir gaya aur chain reaction mein aap glass balustrade se takra kar chotil ho gaye aur kaala dhuan andar kheench liya.',
          insight:
            'Evacuation ke waqt seedhiyon par dhakka-mukki deadly crush aur stampede banati hai.',
          insightSource: 'NDMA Crowd Safety Protocol',
        },
      },
    },

    'frc-d3-stairwell-blocked-door': {
      situationText:
        'Aap 2-hour fire-rated steel staircase door tak pahunche. Kisi ne darwaze ke neeche lakdi ka wedge laga kar use aadha khula chhod rakha hai, aur dhuan andar ghus raha hai.',
      contextHint: 'Fire staircases tabhi safe rehte hain jab heavy fire doors poori tarah band hon.',
      choices: {
        'frc-c3-kick-wedge-seal': {
          label: 'Door wedge ko turant kick karke hatayein aur bhaari steel door ko poori tarah latch hone dein.',
          consequenceText:
            'Door firm click ke saath band ho gaya, jisse corridor ka dhuan aur aag bahar hi ruk gaye. Staircase ki hawa saaf aur safe rahi.',
          insight:
            'Fire doors aag aur dhuen ko compartmentalize karte hain. Unhe khula chhodna poore staircase ko toxic chimney bana deta hai.',
          insightSource: 'NDMA & National Building Code of India',
        },
        'frc-c3-leave-propped': {
          label: 'Darwaza khula rehne dein taaki peeche reh gaye logon ko door kholne ki mehnat na karni pade.',
          consequenceText:
            'Do minute mein corridor ka kaala dhuan stairwell mein ghus gaya aur poori staircase ka rasta block ho gaya.',
          insight:
            'Fire door ko kabhi khula na chhodein. Modern fire doors mein push-bars hote hain jo bahar se asani se khul jaate hain par dhuen ko rokte hain.',
          insightSource: 'NDMA Fire Safety Advisory',
        },
      },
    },

    'frc-d4-ground-exit-triage': {
      situationText:
        'Aap ground discharge door se mall ke rear alleyway mein bahar nikle. Upar 3rd floor ke restaurant facade windows heat se blast ho rahe hain.',
      contextHint: 'Upar se girte hue kaanch ke tukde aur grease flare-ups se bachein.',
      choices: {
        'frc-c4-move-cross-street': {
          label: 'Sabhi logon ko turant alleyway paar karke 80 meter door khule parking lot tarmac par le jayein.',
          consequenceText:
            'Khule maidan mein aane ke agle hi pal wahan par ek bada tempered glass pane gir kar chur-chur ho gaya jahan aap khade the.',
          insight:
            'Building discharge exit drop zones hote hain. Bahar nikalte hi building se kam se kam uski height ka 1.5 times door khule maidan mein jaana chahiye.',
          insightSource: 'NDMA Commercial Complex Evacuation',
        },
        'frc-c4-linger-alley-record': {
          label: 'Gali mein khade hokar phone se dhuen aur aag ka video banayein.',
          consequenceText:
            'Upar se girte pathar aur kaanch ke shards aapke paas gire, aur arriving fire tenders ke raste mein rukawat paida hui.',
          insight:
            'Jalti hui building ke neeche video banana ya khade rehna responding fire brigade ko block karta hai aur deadly falling glass hazard paida karta hai.',
          insightSource: 'NDMA Public Safety Warning',
        },
      },
    },

    'frc-d5-emergency-call-coordination': {
      situationText:
        'Parking lot mein Fire Officer megaphone par pooch rahe hain ki kya kisi ko aag ki origin ka sahi spot pata hai.',
      contextHint: 'Incident Commander ko to-the-point tactical jankari dein.',
      choices: {
        'frc-c5-report-officer': {
          label: 'Officer ke paas jakar saaf shabdon mein batayein: "3rd floor food court, north-east restaurant kitchen duct, customers Fire Exit B se safe hain."',
          consequenceText:
            'Officer ne wireless par direct coordinates de diye, jisse firefighting team bina waqt gavaye 3 minute mein kitchen duct tak pahunch gayi.',
          insight:
            'Incident Commander ko exact floor, spot aur fuel source batana rescue aur containment ko bohot tez karta hai.',
          insightSource: 'NDMA & Fire Service Incident Command System',
        },
        'frc-c5-shout-unstructured': {
          label: 'Zor-zor se chillayein ki poora mall jal raha hai aur sab khatam ho gaya.',
          consequenceText:
            'Aapke chillane se gathered crowd mein panic fail gaya par firefighters ko aag ka spot nahi pata chal saka.',
          insight:
            'Unstructured panic first responders ko distract karta hai. Point-to-point factual reporting hi sabse badi nagrik madad hai.',
          insightSource: 'NDMA Emergency Communication Principles',
        },
      },
    },
  },
};
