// src/i18n/fire.ts
// Natural Roman Hinglish localization for Fire scenario foundation.

import type { LocalizedScenarioData } from './types';

export const fireHinglish: LocalizedScenarioData = {
  title: 'Building Mein Aag Ka Sankat',
  subtitle: 'Residential Building — Raat 02:13 AM',
  nodes: {
    'fire-d1-alarm': {
      situationText:
        '02:13 AM. Smoke alarm ki tezz aawaz se aapki neend khulti hai. Kamre mein ghanghor andhera hai. Darwaze ke neeche se halki aag ki roshni aur kaala dhuan andar aa raha hai.',
      contextHint: 'Aapka darwaza band hai. Doosri taraf aag aur dhuan phail chuka hai.',
      choices: {
        'fire-c1-back-of-hand': {
          label:
            'Darwaze aur metal knob ko kholne se pehle apne haath ke pichle hisse (back of hand) se chhu kar heat test karein.',
          consequenceText:
            'Knob thanda mehsoos hota hai. Neeche baith kar aap darwaze ko halka sa do inch kholte hain aur dekhte hain ki corridor mein upar dhuan hai par neeche rasta dikh raha hai.',
          insight:
            'Darwaza kholne se pehle hamesha haath ke pichle hisse se garmi test karein. Garm darwaze ka matlab doosri taraf bhayanak aag hai.',
          insightSource: 'NDMA Fire Safety Protocols',
        },
        'fire-c1-open-wide': {
          label:
            'Turant darwaza poora khol kar corridor mein tezi se bahar bhagein.',
          consequenceText:
            'Darwaza kholte hi garm hawa aur zehreela kaala dhuan kamre mein ghus jata hai, jisse aakhon mein jalan hoti hai aur saans phoolne lagti hai.',
          insight:
            'Aag ke waqt darwaza achanak poora na kholein. Isse oxygen milne se aag aur bhadakti hai aur zehreela dhuan andar aata hai.',
          insightSource: 'NDMA Residential Fire Directives',
        },
      },
    },
    'fire-d2-smoke-crawl': {
      situationText:
        'Aap corridor mein hain. Kaala zehreela dhuan ceiling ke paas jam raha hai aur neeche utar raha hai. Staircase ka darwaza 30 feet aage hai.',
      contextHint: 'Zehreela dhuan upar uthata hai; saaf hawa floor ke paas rehti hai.',
      choices: {
        'fire-c2-crawl-low': {
          label:
            'Ghutno ke bal baith kar dhuein ke neeche reng kar (crawl) aage badhein, sar ko zameen se 1-2 feet upar rakhein.',
          consequenceText:
            'Neeche rehne se aapko saaf hawa milti hai aur rasta saaf dikhta hai, jisse aap surakshit staircase door tak pahunchte hain.',
          insight:
            'Aag ke dauran garm zehreela dhuan upar rehta hai. Floor se 30-60 cm upar thandi aur saaf hawa rehti hai. Hamesha jhuk kar chalein.',
          insightSource: 'NDMA & Fire Emergency Standards',
        },
        'fire-c2-run-upright': {
          label:
            'Seedhe khade ho kar saans rok kar tezi se aage daudein.',
          consequenceText:
            'Seedhe khade hone se aapka gala dhuein ki lapet mein aa jata hai aur carbon monoxide se chakkar aane lagte hain.',
          insight:
            'Aag mein sabse zyada nuksan dhuein se hota hai. Seedhe khade rehne se zehreeli gas fefdo mein chali jaati hai.',
          insightSource: 'NDMA & Fire Safety Guidelines',
        },
      },
    },
    'fire-d3-staircase': {
      situationText:
        'Aap landing par pahunchte hain. Neeche 4 floor utarna hai. Paas mein lift ka darwaza hai aur saamne emergency fire stairs hain.',
      choices: {
        'fire-c3-stairs-close-door': {
          label:
            'Fire staircase mein jayein, darwaza piche se band karein aur handrail pakad kar neeche utarein.',
          consequenceText:
            'Darwaza band karne se dhuan stairwell mein nahi ghusta. Aap saaf hawa mein neeche aakar ground exit se bahar nikal jate hain.',
          insight:
            'Piche ka darwaza band karne se aag aur dhuan seedhiyon mein nahi phailta. Aag ke waqt sirf stairs ka prayog karein.',
          insightSource: 'NDMA High-Rise Fire Evacuation Guidelines',
        },
        'fire-c3-elevator': {
          label:
            'Lift ka button dabayein taaki jaldi se neeche ground floor par jaa sakein.',
          consequenceText:
            'Cables jalne ke karan lift band pad chuki hai. Is chakkar mein keemti waqt barbaad hota hai aur corridor mein dhuan badhta hai.',
          insight:
            'Aag ke waqt lift ka prayog kabhi na karein. Bijli cut hone se lift phas sakti hai aur lift shaft dhuein ka chimni ban jata hai.',
          insightSource: 'NDMA Fire Safety Guidelines',
        },
      },
    },
    'fire-outcome-node': {
      narrativeText:
        'Aap building se door surakshit outdoor area mein pahunch gaye hain. 112 fire tenders ne pahunch kar aag par kaabu paana shuru kar diya hai.',
    },
  },
};