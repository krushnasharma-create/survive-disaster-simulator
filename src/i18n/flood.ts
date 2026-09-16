// src/i18n/flood.ts
// Natural Roman Hinglish localization for Flood scenario foundation.

import type { LocalizedScenarioData } from './types';

export const floodHinglish: LocalizedScenarioData = {
  title: 'Flash Flood Ki Warning',
  subtitle: 'Low-Lying Colony — Monsoon Baadh',
  nodes: {
    'flood-d1-warning': {
      situationText:
        'Bhari monsoon barish se aapki colony mein paani tezi se bhar raha hai. Paani aapke ghar ke darwaze tak aa chuka hai aur phone par emergency alert bajta hai.',
      contextHint: 'Paani ghar ke andar aana shuru ho gaya hai.',
      choices: {
        'flood-c1-isolate-utilities': {
          label:
            'Main bijli ka MCB switch aur gas cylinder valve band karein, emergency bag lein aur oopri floor par jaane ki taiyyari karein.',
          consequenceText:
            'Aap bijli aur gas band kar dete hain. Paani andar aane par current lagne ya dhmake ka khatra khatam ho jata hai.',
          insight:
            'NDMA Flood Safety Niyam: Paani andar aane se pehle bijli aur gas connection band karein taaki current lagne ka janleva khatra na ho.',
          insightSource: 'NDMA Urban Flood Safety Guidelines',
        },
        'flood-c1-wait-indoors': {
          label:
            'Living room mein rukein aur kapdon se paani ko darwaze par rokne ki koshish karein.',
          consequenceText:
            'Paani ka tezz bahav darwaza tod kar ghus jata hai. Ghutno tak paani aane se bijli ke cords doob jate hain aur spark hota hai.',
          insight:
            'Flash flood ke waqt evacuation ya utility band karne mein der na karein. Doobe hue boards se current lag sakta hai.',
          insightSource: 'NDMA Flood Preparedness Directives',
        },
      },
    },
    'flood-d2-water-depth': {
      situationText:
        'Bahar sadak par kamar tak tezz paani beh raha hai. Building ke oopari floor aur chhat (rooftop) ka rasta khula hai.',
      contextHint: 'Behta hua paani dekhne se zyada shaktishali hota hai.',
      choices: {
        'flood-c2-rooftop-refuge': {
          label:
            'Chhat (roof terrace) par drinking water aur phone lekar jayein aur official rescue ka intezar karein.',
          consequenceText:
            'Aap chhat par surakshit pahunchte hain aur paani ke bahav se door rehte hue rescue team ko signal dete hain.',
          insight:
            'Gehre ya tezz paani mein phansne par oopri manzil ya chhat par vertical refuge lein. Behte paani mein paidal ya car se na niklein.',
          insightSource: 'NDMA Flood Evacuation Guidance',
        },
        'flood-c2-wade-street': {
          label:
            'Sadak ke behte paani mein paidal chalkar highway ki taraf nikalne ki koshish karein.',
          consequenceText:
            'Paani ka chhipa hua bahav aapko gira deta hai. Paani ke neeche khule manholes janleva khatra ban jate hain.',
          insight:
            'Behte hue paani mein kabhi na chalein. Sirf 15 cm tezz paani kisi ko bhi gira sakta hai aur khule manholes dikhte nahi hain.',
          insightSource: 'NDMA & CWC Flood Safety Advisory',
        },
      },
    },
    'flood-outcome-node': {
      narrativeText:
        'Aapne oonchai par suraksha li. State Disaster Response teams ki boats ne sabhi ko surakshit nikal liya hai. Bijli band karne aur behte paani mein na jaane se aapki jaan bachi.',
    },
  },
};