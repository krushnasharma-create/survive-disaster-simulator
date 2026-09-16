// src/i18n/floodStreet.ts
// Natural Roman Hinglish localization for Urban Street & Transit Flood Scenario.
// Grounded in NDMA India, CWC, and 112 ERSS public safety guidelines.

import type { LocalizedScenarioData } from './types';

export const floodStreetHinglish: LocalizedScenarioData = {
  title: 'Sadak Aur Transit Flash Flood',
  subtitle: 'Arterial Ring Road Underpass · Sham 07:15 Baje',
  nodes: {
    // NODE 1: Underpass Decision (Timed: 15s)
    'fls-d1-submerged-underpass': {
      situationText:
        'Sham ke 07:15 baje. Tezz monsoon cloudburst ke dauran aap drive kar ke ghar laut rahe hain. Aage railway underpass gande mitti-bhare stormwater se poori tarah doob chuka hai. Do hatchbacks pehle se hi paani mein tair kar band ho chuki hain. Peechhe wali gadiyan aage badhne ke liye lagataar horn baja rahi hain.',
      contextHint: 'Doobe hue underpass ki gehraai bilkul andaza nahi lagayi ja sakti. Aage ki gadiyan control kho chuki hain.',
      choices: {
        'fls-c1-turn-around': {
          label:
            'Underpass mein ghusne se saaf inkaar karein. Hazard lights on karein, elevated flyover ramp ki taraf gadi modkar oonchi jagah niklein.',
          consequenceText:
            'Aap surakshit tareeqe se bypass flyover par nikal aate hain. Agle 10 minute mein toofani nalon ka paani underpass ko poori tarah bhar deta hai, aur band gadiyan chhat tak doob jaati hain.',
          insight:
            'NDMA "Turn Around, Don\'t Drown" guideline batati hai ki baadh mein aadhi se zyada mautein gadiyon mein hoti hain. Sirf 1 se 2 feet (30-60 cm) behta paani badi se badi car ko baha sakta hai.',
          insightSource: 'NDMA Urban Flood Safety Advisory',
        },
        'fls-c1-drive-through': {
          label:
            'Low gear mein tezi se accelerator daba kar paani cheerte hue doosri taraf nikalne ki koshish karein.',
          consequenceText:
            '20 meter chalte hi car ke engine air intake mein paani ghus jata hai. Engine turant band ho jata hai, electronics short-circuit ho jaate hain, aur buoyant forces tyre ko utha kar car ko behte paani mein taira deti hain.',
          insight:
            'Baadh ke paani mein gadi daudane se engine mein paani ghus jata hai (hydro-lock). Upar uthta paani steering aur brake ka control poori tarah cheen leta hai.',
          insightSource: 'NDMA Flood Guidelines & Traffic Advisory',
        },
        'fls-c1-park-underpass-edge': {
          label:
            'Paani ke kinaare car park karein aur engine on rakh kar baarish rukne ka intezar karein.',
          consequenceText:
            'Sadak par storm runoff tezi se peeche ki taraf phail jata hai. Kuch hi minute mein paani tyre ke upar chadh kar exhaust pipe ko dooba deta hai.',
          insight:
            'Ufan par aate paani ke bilkul kinaare rukna backwater surge ke khatre ko badha deta hai. Hamesha fauran kisi oonchi jagah ki taraf mudna chahiye.',
          insightSource: 'NDMA Flood Preparedness Guidelines',
        },
      },
    },

    // NODE 2A: Elevated Flyover Strategy
    'fls-d2-abandoned-vehicle-safety': {
      situationText:
        'Aap elevated flyover par surakshit pahunch jate hain, par police wireless alert aata hai ki upar wala municipal canal toot chuka hai aur arterial road par bhishan jam lag gaya hai. Barish 40 mm prati ghante ki raftaar se jari hai.',
      contextHint: 'Oonchi jagah par surakshit taureeqa: Apni gadi aise khadi karein ki emergency rescue tenders ka rasta na ruke.',
      choices: {
        'fls-c2-park-multilevel-walk': {
          label:
            'Sadak se hatkar kisi multi-level parking structure ke 2nd floor par gadi park karein, aur pass ki commercial building mein shelter lein.',
          consequenceText:
            'Aapki gadi paani ke surge se upar surakshit ho jaati hai, aur flyover ka rasta NDRF aur police ki rescue gaadiyon ke liye poora khula rehta hai.',
          insight:
            'Gadi ko traffic corridor se hatakar oonchi parking mein khada karna private property ko bachata hai aur emergency services ke raste mein jam nahi lagne deta.',
          insightSource: 'NDMA Urban Flood Management',
        },
        'fls-c2-stay-in-gridlock': {
          label:
            'Flyover ke beech wale lane mein jam ke andar AC chala kar gadi mein hi baithe rahein.',
          consequenceText:
            'Do ghante ke jam mein gadi ka sara fuel khatam ho jata hai, aur aane wali emergency ambulance ko nikalne ke liye jagah nahi milti.',
          insight:
            'Jam mein engine on rakhne se petrol khatam ho jata hai aur vital evacuation corridors block ho jaate hain. Car ko designated elevated jagah park karna sahi civil protocol hai.',
          insightSource: 'Traffic Police & NDMA Disaster Protocol',
        },
      },
    },

    // NODE 2B: Stranded Vehicle Escape
    'fls-d2b-stranded-vehicle-triage': {
      situationText:
        'Aapki band gadi thande mitti-bhare paani mein tair rahi hai, jo darwaze ke aadh tak aa chuka hai. Car ki battery dead ho chuki hai aur bahar ke paani ke dhabaw se driver door jam ho gaya hai.',
      contextHint: 'Hydraulic pressure ka asar: Bahar aur andar ka dhabaw barabar hone se pehle darwaza nahi khulta; window se nikalna zaroori hai.',
      choices: {
        'fls-c2b-roll-window-escape': {
          label:
            'Turant seatbelt kholein, window khol kar ya neeche roll kar ke (ya emergency tool se side glass tod kar) car ki chhat par niklein aur madad ka ishara karein.',
          consequenceText:
            'Aap side window se bahar nikal kar car ki chhat par chadh jate hain. Yahan aap paani se upar rehte hain jab tak samne civil defense volunteers aapko surakshit bacha nahi lete.',
          insight:
            'Doobti car mein bahar ka hydraulic pressure darwaza khulne nahi deta. Bahar aur andar ka dhabaw barabar hone se pehle khidki ke raste bahar nikalna hi sabse surakshit tareeqa hai.',
          insightSource: 'NDMA Vehicle Flood Safety Guidelines',
        },
        'fls-c2b-push-door-hard': {
          label:
            'Seat par baithe rahein aur poori taqat se darwaza bahar ki taraf dhakel kar kholne ki koshish karein.',
          consequenceText:
            'Bahar ke paani ke dhabaw ke aage darwaza band rehta hai. Keemti second barbad ho jaate hain aur paani darwaze ke rubber seal se andar bharne lagta hai.',
          insight:
            'Doobe darwaze par paani ke dhabaw ko dhakel kar kholna namumkin hota hai. Darwaza kholne mein waqt gavane se gadi ke andar paani bharne ka khatra badh jata hai.',
          insightSource: 'NDMA Vehicle Flood Safety Guidelines',
        },
      },
    },

    // NODE 3: Downed Power Lines (Timed: 15s)
    'fls-d3-downed-power-hazard': {
      situationText:
        'Aap oonchi jagah bane shelter complex ki taraf paidal badh rahe hain. Aage 30 meter ka sadak crossing dooba hua hai. Ghutno tak ganda paani bhara hai. Doosri taraf bijli ka toota hua taar paani mein latak raha hai aur safed sparks chhod raha hai.',
      contextHint: 'Paani mein bijli tezi se daudti hai; dooba hua paani khule manhole aur naalon ko chhipa leta hai.',
      choices: {
        'fls-c3-halt-detour-high': {
          label:
            'Paani mein bilkul kadam na rakhein. Turant wapas mudein, lamba concrete pedestrian overpass lein, aur doosre logon ko aage aane se rokein.',
          consequenceText:
            'Aap do aur paidal chalne walon ko rok kar unhe overpass par le aate hain. Thodi hi der mein paani mein dooba transformer tezz awaaz ke sath fuse hota hai, jisse saabit hota hai ki paani mein high voltage current tha.',
          insight:
            'Latakte bijli ke taaron ya poles ke paas floodwater mein kabhi kadam na rakhein. Paani ke zariye current dur tak phel kar invisible death trap bana deta hai.',
          insightSource: 'NDMA Electrical Hazard Protocol in Floods',
        },
        'fls-c3-wade-fast': {
          label:
            'Sparks wali side se dur reh kar sadak ke doosre kinaare se tezi se daud kar nikalne ki koshish karein.',
          consequenceText:
            'Jaise hi aap paani mein kadam rakhte hain, dono taangon mein tezz electric jhanjhanahat mehsoos hoti hai. Aap fauran peeche dry footpath par koodte hain jisse bada shock lagne se bach jata hai.',
          insight:
            'Current wala paani door tak voltage gradient banata hai. Paani mein kisi bhi tarah ki jhanjhanahat mehsoos hone par fauran peeche hatna hi ekmatra bachaav hai.',
          insightSource: 'NDMA Electrical Safety Advisory',
        },
      },
    },

    // NODE 4: Probing Urban Floodwaters
    'fls-d4-water-probe-shelter': {
      situationText:
        'Aap pedestrian bridge se utar kar shelter entrance ke paas pahunchte hain. Yahan pindliyon tak 10 meter ka murky paani bhara hai. Shahron mein paani ke dhabaw se aksar manhole ke bhaari dhakkan nikal kar beh jaate hain, jisse jaanleva underwater bhanwar (vortex) ban jata hai.',
      contextHint: 'Gande mitti-bhare paani mein khule manhole aur toote naale chhipe rehte hain.',
      choices: {
        'fls-c4-probe-stick': {
          label:
            'Pass ke construction site se majboot baans/lakdi ka danda lein, har kadam rakhne se pehle aage ki zameen jaanch karein, aur deewar ke sahare chalein.',
          consequenceText:
            'Dande se zameen jaanchte hue achanak danda 4 feet gehre khule drainage pit mein doob jata hai. Aap us bhanwar se door hatkar surakshit shelter ki seedhiyon tak pahunchte hain.',
          insight:
            'NDMA pedestrian safety guidance batati hai ki doobe hue raaste par chalte waqt dande ya stick se raasta tatolna behad zaroori hai taaki bina dhakkan wale manholes aur sewer drains se bacha ja sake.',
          insightSource: 'NDMA Urban Flood Safety Protocol',
        },
        'fls-c4-walk-blindly': {
          label:
            'Bina kisi dande ke seedhe khule shelter darwaze ki taraf dhyan dekar paani mein aage badhte chale jayein.',
          consequenceText:
            'Aapka dahina pair achanak khule stormwater drain mein gir jata hai. Pair mein gehra chot aati hai aur aap bahav se khud ko mushkil se sambhal kar bahar nikalte hain.',
          insight:
            'Gande baadh ke paani mein bina tatole chalna khule sewer aur tooti sadak mein gir kar behne ya doobne ka mukhya kaaran banta hai.',
          insightSource: 'NDMA Monsoon Safety Advisory',
        },
      },
    },

    // NODE 5: Shelter & Hygiene
    'fls-d5-shelter-hygiene': {
      situationText:
        'Aap 2nd floor par bane relief shelter mein surakshit dakhil hote hain. Aapke kapde gande paani se bheege hain aur pairo par choti kharoch aayi hain. Relief volunteer saaf kambal, bottled paani aur first-aid kit baant rahe hain.',
      contextHint: 'Pani se hone wale bacterial infection (jaise Leptospirosis) aur pet ke rogon se bachein.',
      choices: {
        'fls-c5-sanitize-drink-bottled': {
          label:
            'Kharochon ko antiseptic aur saaf paani se dho kar saaf karein, gandi soaked socks phenk dein, aur sirf sealed bottled paani hi piyein.',
          consequenceText:
            'Ghaav saaf karne se leptospirosis aur sewage ke bacterial infection ka khatra taal jata hai. Aap relief register mein apna naam darj karwate hain.',
          insight:
            'Baadh ke paani mein sewer ka untreated kachra hota hai. Choton ko turant antiseptic se saaf karna aur sirf saaf packaged paani peena bimaariyon se bachata hai.',
          insightSource: 'NDMA Public Health & Epidemic Prevention',
        },
        'fls-c5-drink-tap-neglect': {
          label:
            'Bathroom ke tap ka paani piyein aur geele kapde aur joote pehne hue hi so jayein.',
          consequenceText:
            'Building ki municipal water supply baadh ke paani se contaminated ho chuki thi. Chot ko saaf na karne se subah tak pair mein tezz infection phail jata hai.',
          insight:
            'Baadh ke waqt municipal line aksar leak hokar gande paani se mil jaati hai. Bina ubla nal ka paani peena aur khuli chot ko ignore karna bimaar kar sakta hai.',
          insightSource: 'NDMA Health Advisory for Flood Disasters',
        },
      },
    },

    // OUTCOME NODE
    'fls-outcome-node': {
      narrativeText:
        'Aapne urban transit flash flood ka safalta-poorvak saamna kiya: doobe hue underpass ke death-trap se bache, toote bijli ke taaron se dur rahe, dande se khule manhole ka pata lagaya aur surakshit community shelter pahunche. NDRF boats aur relief teams ne corridor ko control mein le liya hai.',
    },
  },
};
