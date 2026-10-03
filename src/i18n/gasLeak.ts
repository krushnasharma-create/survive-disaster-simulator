// src/i18n/gasLeak.ts
// Roman Hinglish localization for Gas Leakage dynamic simulation.
// Authentic emergency vocabulary with natural conversational Hindi.

import type { LocalizedScenarioData } from './types';

export const GAS_LEAK_HINGLISH_TAKEAWAYS: string[] = [
  'BIJLI KE SWITCH YA GADI KO MAT CHHOOYEIN: Switch ya spark plug se nikalne wala chhota sa spark bhi gas cloud ko turant blast kar sakta hai. Kisi bhi electrical device ko on ya off na karein.',
  'INSULATED TOOL SE MAIN VALVE BAND KAREIN: Agar surakshit ho, toh pipe ke quarter-turn brass valve ko turant 90 degree ghuma kar supply band karein.',
  'SIRF NATURAL CROSS-VENTILATION KAREIN: Darwaze aur khidkiyan khol kar hawa aane dein. Electric exhaust fan ya blower ka istemal bilkul na karein kyunki unme spark hota hai.',
  'HAWA KI VIPREET DISHA (UPWIND) MEIN NIKLEIN: Gas plume hawa ke saath behta hai. Sabhi logon ko upwind ya crosswind le jayein aur kam se kam 100 meter ka surakshit perimeter banayein.',
  '112 AUR GAS HELPLINE 1906 PAR CALL KAREIN: Surakshit upwind doori par pahunch kar 112 ERSS (Fire Services) aur 1906 (National Gas Leak Helpline) ko suchit karein.',
];

export const gasLeakHinglish: LocalizedScenarioData = {
  title: 'Hazardous Gas Leakage & Atmospheric Vapor Surge',
  subtitle: 'Dynamic Industrial & Residential Utility Enclosure · 10:15 AM',
  nodes: {
    'gas-event-detect': {
      situationText:
        'Corridor mein achanak sade hue ande (mercaptan sulfur) ki teekhi badboo phail gayi hai. Utility meter room se pressurized hissing ki aawaz aa rahi hai. Gas alarm baj rahe hain aur log ghabra rahe hain. Aapke paas kuch seconds hain.',
      contextHint: 'NDMA Gas Safety Protocol: Spark ke sabhi zariye band karein aur main isolation valve band karein.',
      choices: {
        'gas-d1-isolate-valve': {
          label: 'Main gas quarter-turn valve ko insulated tool se band karein, khidkiyan khol kar natural hawa aane dein, aur bina switch chhue sabhi ko upwind evacuate karein.',
          consequenceText:
            'Aapne valve ko 90 degree ghuma kar gas ki supply turant band kar di aur khidkiyan khol kar natural cross-ventilation shuru kiya. Vapors dheere-dheere dilute hone lage.',
          insight:
            'NDMA niyam ke mutabiq gas leak par quarter-turn valve ko supply pipe ke perpendicular turn karein. Natural hawa se gas bina kisi bijli ke spark ke dilute hoti hai.',
        },
        'gas-d1-electric-fan': {
          label: 'Light aur exhaust fan on karein taaki pipe ko dekh sakein aur badboo jaldi bahar nikal jaye.',
          consequenceText:
            'Wall switch flip karte hi internal electrical arc se tezz neeli aag ki lapet uthi! Switch ke contact point se explosion ka khatra paida ho gaya.',
          insight:
            'Gas leak mein light switch ya fan bilkul na chhuein. Switch ke internal contact spark se flammable gas turant explode ho sakti hai.',
        },
        'gas-d1-seal-room': {
          label: 'Meter room ka darwaza tight band karein taaki badboo bahar na phailay aur 15 minute wait karein.',
          consequenceText:
            'Bina valve band kiye darwaza band karne se band kamre mein gas ka explosive pressure ban gaya aur zehreeli gas stairwells mein risne lagi.',
          insight:
            'Gas ko band kamre mein kaid karna ek bomb banane jaisa hai. Source par gas isolate karein aur bahar ki taraf ventilate karein.',
        },
      },
    },

    'gas-event-high-conc': {
      situationText:
        'Gas ki matra suraksha seema se kaafi upar (>40% LEL) chali gayi hai. Logon ko chakkar, ulti aur saans lene mein takleef hone lagi hai. Hallway mein oxygen kam ho rahi hai.',
      contextHint: 'Asphyxiation Hazard: Hydrocarbon gas oxygen ko displace karti hai. Mooh dhak kar neeche jhukte hue niklein.',
      choices: {
        'gas-d2-damp-cloth-evac': {
          label: 'Geela kapda naak-mooh par rakhein, gas cloud ke neeche jhuk kar chalein aur sabhi ko bahar upwind road par le jayein.',
          consequenceText:
            'Neeche jhuk kar chalne se fefde toxic vapor se bach gaye. Aapne sabhi ko bahar taazi hawa mein surakshit pahuncha diya.',
          insight:
            'Geela kapda temporary airway protection deta hai. Gas ke neeche rehne se taazi oxygen milti hai jab tak aap bahar na pahunchein.',
        },
        'gas-d2-tape-repair': {
          label: 'Leaking pipe par duct tape aur kapda lapet kar leak rokne ki koshish karein.',
          consequenceText:
            'High line pressure se tape phat gayi aur high-pressure gas se chehre par chemical exposure aur disorientation ho gaya.',
          insight:
            'Pressurized gas pipeline par khud mechanical repair ka prayas na karein. High-pressure gas se cold burns aur behoshi ka khatra hota hai.',
        },
        'gas-d2-wait-landing': {
          label: 'Logon ko stairwell landing par baith kar aaram karne ko kahein jab tak supervisor na aaye.',
          consequenceText:
            'Stairwell mein bhari gas jamne se oxygen ki bhari kami ho gayi aur kai log behosh hone ki sthiti mein aa gaye.',
          insight:
            'Gas aapatkal mein kisi ko bhi enclosed stairwell mein aaram karne na dein. 3 minute se kam samay mein behoshi aa sakti hai.',
        },
      },
    },

    'gas-event-ignition': {
      situationText:
        'CRITICAL IGNITION KHATRA: Gas explosive limit (5%–15%) mein pahunch chuki hai. Bahar ek delivery boy scooter kick marne wala hai aur paas ka relay sparking kar raha hai.',
      contextHint: 'Explosion Danger: Koi bhi spark ya engine start vapor cloud ko turant detonate kar dega.',
      choices: {
        'gas-d3-halt-spark': {
          label: 'Zor se chilla kar sabhi gadiyan aur spark sources turant rokein, bidi-cigarette bujhwayein aur 100m upwind perimeter banayein.',
          consequenceText:
            'Aapki aawaz par driver ne key band kar di. Bystanders ko door hata kar 100 meter ka upwind exclusion zone bana liya gaya.',
          insight:
            'Vehicle spark plugs aur cigarettes vapor cloud explosions ke mukhya kaaran hain. 100 meter ka upwind exclusion zone blast se bachata hai.',
        },
        'gas-d3-pull-mcb': {
          label: 'Meter room ke paas main electrical breaker switch ko jhatke se neeche kheench kar power band karein.',
          consequenceText:
            'Heavy electrical breaker switch off karte hi panel ke andar bhayanak high-voltage arc utha aur explosive pressure bang hua!',
          insight:
            'Gas-affected area mein electrical breakers ko na chhuein. Breakers ke internal heavy electrical arc se gas turant explode hoti hai.',
        },
        'gas-d3-use-phone': {
          label: 'Gas leak ke beech khade hokar mobile phone par family ko call karein aur advice maangein.',
          consequenceText:
            'Explosive atmosphere mein uncertified non-intrinsically safe consumer phone use karna Hazmat protocol ke khilaf tha.',
          insight:
            'Consumer mobile phones intrinsically safe nahi hote. Battery aur RF signals explosive gas mein spark paida kar sakte hain.',
        },
      },
    },

    'gas-event-vent-fail': {
      situationText:
        'Hawa ka aana-jana rukk gaya hai. Basement aur utility shafts mein dense gas pockets jam gaye hain aur residential flats ki taraf badh rahe hain.',
      contextHint: 'Natural Cross-Draft: Natural hawa se gas nikaalein, bina kisi electric motor wale fan ke.',
      choices: {
        'gas-d4-natural-crossdraft': {
          label: 'Exterior doors aur ground-level khidkiyan khol kar natural cross-draft banayein bina kisi electric fan ke.',
          consequenceText:
            'Darwaze kholne se natural hawa ka flow shuru hua aur band gas pockets bina spark ke bahar nikal kar dilute ho gaye.',
          insight:
            'Natural convective ventilation bina kisi spark hazard ke hawa circulate karti hai aur gas concentration ko safe level par laati hai.',
        },
        'gas-d4-plug-blower': {
          label: 'Industrial blower fan ko wall socket mein plug karke basement se gas udane ki koshish karein.',
          consequenceText:
            'Plug lagate hi socket mein spark hua aur blower motor ke carbon brushes ne gas ke beech localized flash fire shuru kar di!',
          insight:
            'Standard portable fans ke brush motors continuous spark karte hain. Sirf certified explosion-proof equipment hi use kiya ja sakta hai.',
        },
        'gas-d4-retreat-storeroom': {
          label: 'Bina khidki wale interior storeroom mein sabhi ke saath ghus kar darwaza lock karein.',
          consequenceText:
            'Bina khidki wale kamre mein gas darwaze ke neeche se bhar gayi aur sabhi log oxygen-depleted trap mein phans gaye.',
          insight:
            'Gas leak ke dauran windowless rooms mein bilkul na chupein. Yeh kamre lethal asphyxiation chambers ban jaate hain.',
        },
      },
    },

    'gas-event-evac-alert': {
      situationText:
        'COMMUNITY EVACUATION: Society mein bhag-daud mach gayi hai. Log chilla rahe hain aur kuch log ghabrahat mein hawa ke saath behte gas cloud ki taraf bhaag rahe hain.',
      contextHint: 'Upwind Evacuation: Gas hawa ke saath behti hai. Hawa ke vipreet (UPWIND) ya perpendicular bhaagein.',
      choices: {
        'gas-d5-upwind-marshall': {
          label: 'Command lein: sabhi logon ko hawa ki vipreet disha (UPWIND) aur crosswind assembly ground ki taraf nikaalein.',
          consequenceText:
            'Aapke nirdeshon se bheed gas cloud se door upwind safe ground par pahunch gayi aur toxic inhalation se bach gayi.',
          insight:
            'Hamesha hawa ke vipreet (UPWIND) ya crosswind niklein. Downwind bhaagne se aap expanding gas cloud ke seedhe raaste mein aa jate hain.',
        },
        'gas-d5-run-downwind': {
          label: 'Bheed ke peeche main raste par bhaagein jahan gas ki badboo sabse zyada tezz hai.',
          consequenceText:
            'Downwind bhaagne se log gas ke sabse dense badal mein phans gaye aur behosh hone lage.',
          insight:
            'Downwind bhaagne par gas ki speed ke sath exposure badhta hai aur respiratory collapse ka khatra hota hai.',
        },
        'gas-d5-balcony-shelter': {
          label: 'Logon ko flat ki balconies par khade reh kar aaram se wait karne ko kahein.',
          consequenceText:
            'Lighter-than-air methane gas seedhe upar balconies par pahunch gayi aur log gas plume mein ghir gaye.',
          insight:
            'Methane hawa se halki hoti hai aur seedhe building facade ke sath upar chadhti hai. Ground-level open area mein nikalna anivarya hai.',
        },
      },
    },

    'gas-event-responder': {
      situationText:
        '112 ERSS Fire & Hazmat tenders siren ke saath site par pahunch chuki hain. Fire Station Officer ne turant isolation valve status aur headcount report maangi hai.',
      contextHint: 'Incident Handover: Satik jaankari dein: valve ka status, leak kahan hai, kitne log bache hain.',
      choices: {
        'gas-d6-concise-handover': {
          label: 'Satik sit-rep dein: main valve band hai, pipeline rupture location, headcount aur clear perimeter confirm karein.',
          consequenceText:
            'Aapki briefing se Fire Brigade ne turant gas detectors aur ventilation fans lagaye aur sthiti poori tarah control mein aa gayi.',
          insight:
            'Civilian sit-rep se responders ke keemti minutes bachte hain aur targeted containment bina delay ke ho pata hai.',
        },
        'gas-d6-reenter-belongings': {
          label: 'Cordon tod kar laptop aur documents lene wapas building ke andar bhaagein.',
          consequenceText:
            'Firefighters ko aapko pakad kar bahar kheanchna pada. Is laparwahi se emergency operations delay hue.',
          insight:
            'Jab tak authorities area ko safe na ghoshit karein, tab tak hazmat zone mein wapas na jayein. Zindagi se keemti kuch nahi.',
        },
        'gas-d6-argue-vehicle': {
          label: 'Basement se apni gaadi nikalne ke liye firefighters se behas karein.',
          consequenceText:
            'Basement mein car start karne se gas ignite ho sakti thi. Responders ne strict hokar aapko perimeter ke bahar bheja.',
          insight:
            'Internal combustion engine gas ke liye sabse bada spark source hai. Gas leak ke 100m ke daayre mein gaadi start na karein.',
        },
      },
    },

    'gas-outcome-containment': {
      narrativeText:
        'INCIDENT CONTAINED // HAZMAT OPERATION SAFAL.\n\nAapke NDMA-aligned faislon ne bhayanak gas blast ko rok liya. Main valve isolate karne, natural ventilation banaye rakhne aur sabhi ko upwind evacuate karne se sabhi ki jaan bach gayi. Fire Services aur City Gas ne pipeline ko surakshit cap kar diya.',
    },

    'gas-outcome-critical': {
      narrativeText:
        'CRITICAL INCIDENT // EXPLOSIVE DEFLAGRATION.\n\nElectrical spark aur unmitigated gas accumulation ke kaaran bhayanak vapor cloud explosion hua. Structural blast damage aur severe burn injuries ke kaaran emergency hospitalization ki zarurat padi.',
    },
  },
};
