/* ══════════════════════════════════════════════════════════════════════════════
   OPERATION WORLD — Country Prayer Narratives
   Source: https://operationworld.org (per-country pages)
   Steward: WEC International + InterVarsity Press
   License: "Content taken or adapted from Operation World, 7th Edition (2010)
            and Pray for the World (2015). Both books are published by
            InterVarsity Press. All rights reserved."
            — Excerpts used here under fair-use for ministry/educational
              purposes; each entry retains its `source` link for attribution.

   COVERAGE: BAL Extreme tier (ranks 1–15). Expand as needed by re-running
   the scraper at /tmp/ow_scrape2.py with additional ISO/slug pairs and
   regenerating this file via /tmp/build_ow_js.py.

   Field shape per ISO key:
     prayerAnswers     — narrative paragraphs (typically 1, "Answers to Prayer")
     prayerChallenges  — bullet list (typically 3–7, "Challenges for Prayer")
     summary           — first narrative paragraph, used as country card lead
     stats             — raw OW key stats (Capital, Population, % Christian, etc.)
     source            — canonical OW page URL
   ══════════════════════════════════════════════════════════════════════════════ */

export const OW_DATA = {
  SO: {
    name: 'Somalia',
    source: 'https://operationworld.org/locations/somalia',
    summary: 'Stability in Africa’s most failed state remains depressingly elusive. Somalia now has a parliament and recognized national leaders after 20 years without an effective central government. But the militant Islamist group Al-Shabaab (linked to Al-Qaeda) still controls much of southern and central Somalia, and continues to hold influence in rural areas. Although it no longer contests control of Mogadishu, it continues murderous bombing attacks there, and in neighboring countries. It even battles against the Islamic State for “terrorist primacy” in the Puntland area. Pray that Somalia’s rulers might learn from the past, govern for the good of the people, and respect human rights and religious freedom. Pray that those deceived by the enemy into committing terrorism might encounter Jesus who loves them and died on their behalf.',
    prayerAnswers: [
      'Stability in Africa’s most failed state remains depressingly elusive. Somalia now has a parliament and recognized national leaders after 20 years without an effective central government. But the militant Islamist group Al-Shabaab (linked to Al-Qaeda) still controls much of southern and central Somalia, and continues to hold influence in rural areas. Although it no longer contests control of Mogadishu, it continues murderous bombing attacks there, and in neighboring countries. It even battles against the Islamic State for “terrorist primacy” in the Puntland area. Pray that Somalia’s rulers might learn from the past, govern for the good of the people, and respect human rights and religious freedom. Pray that those deceived by the enemy into committing terrorism might encounter Jesus who loves them and died on their behalf.',
      'A negative prejudice against Christianity must be overcome if the community of faith is ever to make a greater breakthrough. These issues include:',
    ],
    prayerChallenges: [
      'False notions of Christianity. Pray that the association of Christianity with Western decadence, European colonialism and Ethiopian interference would be broken.',
      'Practical demonstrations of Christ’s love through aid and mercy ministry must be done in the right manner. Pray that refugees and recipients of help from Christians would be touched and would respond.',
      'Nomadic pastoralism and the tightly bound clan structures of Somali society are perceived to be incompatible with Christianity; 60-70% of Somalis are at least semi-nomadic and 95% are tied into clans.',
    ],
    stats: {
      "Continent": "Africa",
      "Capital": "Mogadishu",
      "Population": "19,655,000",
      "% Urban": "49.1 %",
      "Population Under 15 Yrs": "46 %",
      "Official Language": "Somali, Arabic (few speak it)",
      "Languages": "13",
      "Literacy Rate": "38 %",
      "Life Expectancy": "55.3 yrs (231/236)",
      "% Christian": "0.3 %",
      "% Evangelical": "0 %",
      "Largest Religion": "Muslim",
      "% Largest Religion": "99.7 %",
      "People Groups": "22",
      "Least Reached People Groups": "20",
      "% Unevangelized": "62 %",
      "Persecution Ranking": "2 / 50"
    },
  },
  AF: {
    name: 'Afghanistan',
    source: 'https://operationworld.org/locations/afghanistan',
    summary: 'The re-conquest of Afghanistan by the Taliban in 2021 came as a shock to many. These events led to the suspension of humanitarian aid to the needy people of Afghanistan, the reintroduction of much harsher Islamic laws, the flight of millions of Afghans from Taliban rule, the intensified persecution (and even manhunt) of Christians, and the emboldening of Islamist movements elsewhere against what they perceive as a weak and failing Western world. The destruction and aftermath of the 2023 earthquake, the gripping poverty and hunger, and the heavy hand of this Islamist regime also intensify the suffering. There is so much to pray for; above all, pray that God preserve the lives of Afghans so that they might hear the good news of Jesus.',
    prayerAnswers: [
      'The re-conquest of Afghanistan by the Taliban in 2021 came as a shock to many. These events led to the suspension of humanitarian aid to the needy people of Afghanistan, the reintroduction of much harsher Islamic laws, the flight of millions of Afghans from Taliban rule, the intensified persecution (and even manhunt) of Christians, and the emboldening of Islamist movements elsewhere against what they perceive as a weak and failing Western world. The destruction and aftermath of the 2023 earthquake, the gripping poverty and hunger, and the heavy hand of this Islamist regime also intensify the suffering. There is so much to pray for; above all, pray that God preserve the lives of Afghans so that they might hear the good news of Jesus.',
      'The status of women deserves special prayer. Virtually all progress made from 2001-2021 has been undone by the Taliban since September 2021. Women are once again all but banned from participating in public life. Numerous women die in childbirth in Afghanistan because many cannot receive healthcare from male doctors. Women’s voices are forbidden to be heard in public, and they cannot travel without a male guardian present. One-third of women suffer from physical violence. Widows face very difficult circumstances, and suicide is common. Special radio programmes share with women from the Bible, about the love and value God holds for them. Female literacy had improved from 11% in 1979 to over 55% in 2018; perhaps this will enable more Afghan women to read material that will lead them to Jesus. Pray for justice and freedom from gender-based oppression, and especially that women might find the true freedom that comes only through Christ.',
    ],
    prayerChallenges: [],
    stats: {
      "Continent": "Asia",
      "Capital": "Kabul",
      "Population": "43,844,000",
      "% Urban": "27.6 %",
      "Population Under 15 Yrs": "42 %",
      "Official Language": "Pashtu (used by 48% of population), Dari (Afghan Persian, used by 77%)",
      "Languages": "41",
      "Literacy Rate": "32 %",
      "Life Expectancy": "62 yrs (208/236)",
      "HDI Ranking": "180 / 189",
      "% Christian": "0.1 %",
      "% Evangelical": "0 %",
      "Largest Religion": "Muslim",
      "% Largest Religion": "99.9 %",
      "People Groups": "58",
      "Least Reached People Groups": "58",
      "% Unevangelized": "81 %",
      "Persecution Ranking": "11 / 50"
    },
  },
  YE: {
    name: 'Yemen',
    source: 'https://operationworld.org/locations/yemen',
    summary: 'Amidst the terrible suffering, Yemenis are finding life in Christ through radio, Bible distribution, careful witness, and dreams and visions from the Lord! Believers meet secretly and only in small groups. They often face dangerous opposition. Praise God for these followers of Jesus. Pray for them as they learn how to honour their culture and family while faithfully serving the Lord. There may be more Yemeni followers of Christ than all the other indigenous groups in the Arabian Peninsula combined!',
    prayerAnswers: [
      'Amidst the terrible suffering, Yemenis are finding life in Christ through radio, Bible distribution, careful witness, and dreams and visions from the Lord! Believers meet secretly and only in small groups. They often face dangerous opposition. Praise God for these followers of Jesus. Pray for them as they learn how to honour their culture and family while faithfully serving the Lord. There may be more Yemeni followers of Christ than all the other indigenous groups in the Arabian Peninsula combined!',
      'Yemen has suffered in recent decades from three civil wars, tribal conflicts, and war in nearby countries. Currently Yemen is divided between Shi’a Houthi rebels who control much of the country and Sunni forces supporting the ousted President. Radical Islamist groups like Al Qaeda and ISIS have seized on the chaos to take control of other areas. Neighbouring countries such as Saudi Arabia, U.A.E. and Iran have used Yemen as a theatre for their own proxy wars. Western governments, including the USA and UK, continue to sell arms that are used by their allies to indiscriminately take Yemeni lives. Many civilians have died in bombings, including people in schools, hospitals, and prisons. As a result of all this upheaval, much of the population has faced food shortages and even starvation in recent years. Few children can regularly go to school and fewer adults have a reliable income. May the God of peace and justice bring both to this land of great suffering.',
    ],
    prayerChallenges: [],
    stats: {
      "Continent": "Asia",
      "Capital": "Sana'a",
      "Population": "41,774,000",
      "% Urban": "41.1 %",
      "Population Under 15 Yrs": "39 %",
      "Official Language": "Arabic",
      "Languages": "13",
      "Literacy Rate": "70 %",
      "Life Expectancy": "63.8 yrs (197/236)",
      "HDI Ranking": "183 / 189",
      "% Christian": "0.1 %",
      "% Evangelical": "0 %",
      "Largest Religion": "Muslim",
      "% Largest Religion": "99.9 %",
      "People Groups": "28",
      "Least Reached People Groups": "20",
      "% Unevangelized": "64 %",
      "Persecution Ranking": "3 / 50"
    },
  },
  KP: {
    name: 'North Korea',
    source: 'https://operationworld.org/locations/korea-democratic-peoples-rep',
    summary: 'North Korea today is like a nightmare. The state creates a cult around the young “Supreme Leader” (Kim Jong-un) and his dead grandfather (Kim Il-Sung), and does not allow the people to interact with the outside world. More than 3 million people have starved to death since 1994. Foreign charities can bring food, farming technology, training, and start business ventures, but are restricted in their activites and closely watched. Pray that help will reach the desperate, hungry people. Pray that in God’s timing a change would come to completely free and transform this land.',
    prayerAnswers: [
      'North Korea today is like a nightmare. The state creates a cult around the young “Supreme Leader” (Kim Jong-un) and his dead grandfather (Kim Il-Sung), and does not allow the people to interact with the outside world. More than 3 million people have starved to death since 1994. Foreign charities can bring food, farming technology, training, and start business ventures, but are restricted in their activites and closely watched. Pray that help will reach the desperate, hungry people. Pray that in God’s timing a change would come to completely free and transform this land.',
      'The Korean revival (1907) began in the Church in North Korea! People in those days called Pyongyang the “Jerusalem of the East”. But most Christians fled to the South during the Korean War, or died as martyrs. Now if you even say the name “Jesus” aloud you may die for it. We do not know much about the underground Church, but we know it survived and even grows. The government holds up to 100,000 Christians in labour camps. Pray for North Korean believers to persevere in probably the most difficult country for Christians.',
    ],
    prayerChallenges: [],
    stats: {
      "Continent": "Asia",
      "Capital": "Pyongyang",
      "Population": "26,571,000",
      "% Urban": "63.8 %",
      "Population Under 15 Yrs": "20 %",
      "Official Language": "Korean",
      "Languages": "2",
      "Literacy Rate": "99 %",
      "Life Expectancy": "73.3 yrs (119/236)",
      "% Christian": "1.5 %",
      "% Evangelical": "1 %",
      "Largest Religion": "Non-religious",
      "% Largest Religion": "69.3 %",
      "People Groups": "4",
      "Least Reached People Groups": "2",
      "% Unevangelized": "70 %",
      "Persecution Ranking": "1 / 50"
    },
  },
  MR: {
    name: 'Mauritania',
    source: 'https://operationworld.org/locations/mauritania',
    summary: 'Islam has been entrenched for 1,000 years with little challenge. Mauritanians see their nation as the most Islamic country in Africa. Many are the barriers to change – laws hindering proclamation of the gospel, powerful social resistance to change, an historic reluctance to engage with the outside world, geographical isolation, low literacy and minimal exposure to Christians and Christian media. The arrest of alleged converts to Christianity in 2023 highlights the hostility to even the notion of Mauritanians leaving Islam. Pray for greater spiritual openness and hunger for God. World Vision, Caritas, the Lutherans and others are working in development as well as with issues such as disease awareness and prevention, human rights and environmental protection.',
    prayerAnswers: [
      'Islam has been entrenched for 1,000 years with little challenge. Mauritanians see their nation as the most Islamic country in Africa. Many are the barriers to change – laws hindering proclamation of the gospel, powerful social resistance to change, an historic reluctance to engage with the outside world, geographical isolation, low literacy and minimal exposure to Christians and Christian media. The arrest of alleged converts to Christianity in 2023 highlights the hostility to even the notion of Mauritanians leaving Islam. Pray for greater spiritual openness and hunger for God. World Vision, Caritas, the Lutherans and others are working in development as well as with issues such as disease awareness and prevention, human rights and environmental protection.',
    ],
    prayerChallenges: [],
    stats: {
      "Continent": "Africa",
      "Capital": "Nouakchott",
      "Population": "5,315,000",
      "% Urban": "59.2 %",
      "Population Under 15 Yrs": "40 %",
      "Official Language": "Arabic. Pular, Soninke and Wolof are all national languages",
      "Languages": "7",
      "Literacy Rate": "52 %",
      "Life Expectancy": "64.4 yrs (195/236)",
      "HDI Ranking": "158 / 189",
      "% Christian": "0.3 %",
      "% Evangelical": "0.1 %",
      "Largest Religion": "Muslim",
      "% Largest Religion": "99.8 %",
      "People Groups": "17",
      "Least Reached People Groups": "15",
      "% Unevangelized": "73 %",
      "Persecution Ranking": "21 / 50"
    },
  },
  ER: {
    name: 'Eritrea',
    source: 'https://operationworld.org/locations/eritrea',
    summary: 'Eritrea is located in a region fraught with conflict and crises. Many face extreme poverty with no relief ahead as drought and food shortages are serious challenges in this one-party state. Mandatory military service limits the size of the workforce. Many people flee the country to escape the military, and the money sent home by those who live abroad now provides a vital source of income for the country. Pray for the government to focus on caring and providing for its own people – it has a terrible record on human rights and press freedoms, accompanied by an obsession with military power and control.',
    prayerAnswers: [
      'Eritrea is located in a region fraught with conflict and crises. Many face extreme poverty with no relief ahead as drought and food shortages are serious challenges in this one-party state. Mandatory military service limits the size of the workforce. Many people flee the country to escape the military, and the money sent home by those who live abroad now provides a vital source of income for the country. Pray for the government to focus on caring and providing for its own people – it has a terrible record on human rights and press freedoms, accompanied by an obsession with military power and control.',
      'Religious freedom remains a major issue. A 2002 government ruling banned all religious groups from meeting together and practicing their faith without official recognition, and it granted recognition only to Sunni Islam, Eritrean Orthodox, Roman Catholic and Evangelical Lutheran groups. The effects of this on all Eritreans are significant, especially so on Christians within non-approved groups. Some posit this as a reaction against the evangelical growth within the Orthodox Church and during the long war with Ethiopia. Pray for government acceptance of religious groups and for restoration of basic human rights and religious freedom to all Eritreans.',
    ],
    prayerChallenges: [],
    stats: {
      "Continent": "Africa",
      "Capital": "Asmara",
      "Population": "3,607,000",
      "% Urban": "44.6 %",
      "Official Language": "Tigrinya. Tigre, Arabic and English (especially for secondary and tertiary education) also widely used",
      "Languages": "15",
      "Literacy Rate": "69 %",
      "Life Expectancy": "66.5 yrs (181/236)",
      "HDI Ranking": "176 / 189",
      "% Christian": "47.3 %",
      "% Evangelical": "2.1 %",
      "Largest Religion": "Muslim",
      "% Largest Religion": "50.3 %",
      "People Groups": "15",
      "Least Reached People Groups": "10",
      "% Unevangelized": "29 %",
      "Persecution Ranking": "5 / 50"
    },
  },
  LY: {
    name: 'Libya',
    source: 'https://operationworld.org/locations/libya',
    summary: 'Qaddafi’s fall in 2011 led to nearly a decade of civil war between different factions. A permanent ceasefire was signed in 2020, but political wrangling between the factions have prevented elections. Libyans desire to see progress in their nation, but those in power – and foreign interests as well – continue to prefer conflict over reconciliation. Pray for a resolution to the issue of governance, for the rebuilding of infrastructure that enables communities to thrive, and most of all, for an opening of these lands and people to the gospel.',
    prayerAnswers: [
      'Qaddafi’s fall in 2011 led to nearly a decade of civil war between different factions. A permanent ceasefire was signed in 2020, but political wrangling between the factions have prevented elections. Libyans desire to see progress in their nation, but those in power – and foreign interests as well – continue to prefer conflict over reconciliation. Pray for a resolution to the issue of governance, for the rebuilding of infrastructure that enables communities to thrive, and most of all, for an opening of these lands and people to the gospel.',
      'Large numbers of migrants come into Libya. Most come from Sub-Saharan Africa, but some come from North Africa and even parts of Asia. A few find work in Libya, but more cross the dangerous deserts and seas in search of a new life in Europe. In the last decade, around 1 million people have made the dangerous crossing to Italy. The current chaos in Libya gives freedom for traffickers to exploit these vulnerable people. Pray that these tens or even hundreds of thousands would find salvation, and not just earthly gain. Some of these migrants are believers; many others find Jesus in the midst of their turbulent lives. Pray that they might have a powerful spiritual impact on Libyans and on fellow migrants.',
    ],
    prayerChallenges: [],
    stats: {
      "Continent": "Africa",
      "Capital": "Tripoli",
      "Population": "7,459,000",
      "% Urban": "82.2 %",
      "Population Under 15 Yrs": "28 %",
      "Official Language": "Arabic",
      "Languages": "10",
      "Literacy Rate": "91 %",
      "Life Expectancy": "71.9 yrs (134/236)",
      "HDI Ranking": "104 / 189",
      "% Christian": "2.6 %",
      "% Evangelical": "0.3 %",
      "Largest Religion": "Muslim",
      "% Largest Religion": "97 %",
      "People Groups": "45",
      "Least Reached People Groups": "34",
      "% Unevangelized": "66 %",
      "Persecution Ranking": "9 / 50"
    },
  },
  DZ: {
    name: 'Algeria',
    source: 'https://operationworld.org/locations/algeria',
    summary: 'The growth of the Algerian Church over the past decade is an answer to prayer! Many years of hard work by missionaries and praying people produced beautiful fruit. Most believers come from a Kabyle Berber background, but faith grows among Arabs and most other people groups as well. The Christian community enjoys a spirit of unity, which stands out from the long history of conflict among ethnic groups. Some received supernatural visions of Jesus, but most came to Him through personal evangelism. New fellowships began throughout Algeria, partly because Berber believers moved into unreached Arab areas with the Gospel.',
    prayerAnswers: [
      'The growth of the Algerian Church over the past decade is an answer to prayer! Many years of hard work by missionaries and praying people produced beautiful fruit. Most believers come from a Kabyle Berber background, but faith grows among Arabs and most other people groups as well. The Christian community enjoys a spirit of unity, which stands out from the long history of conflict among ethnic groups. Some received supernatural visions of Jesus, but most came to Him through personal evangelism. New fellowships began throughout Algeria, partly because Berber believers moved into unreached Arab areas with the Gospel.',
      'The Church has a very indigenous, truly Algerian way of expressing faith. Scriptures and study materials, worship styles, and even training and leadership reflect Algerian culture well. Algeria needs more workers to help strengthen the local church and to bring the gospel to the unreached millions, but access for missionaries is a real challenge. Several agencies reach out to Algerians through radio, literature, satellite TV, portable media, and Bible correspondence courses. Praise God for the increase of these resources, and pray for wider distribution! The pressure on churches has been increasing for a few years now, so it is very important to have Christian resources in languages and formats that will allow the persecuted church to continue to grow and spread.',
    ],
    prayerChallenges: [],
    stats: {
      "Continent": "Africa",
      "Capital": "Algiers",
      "Population": "47,435,000",
      "% Urban": "76.2 %",
      "Population Under 15 Yrs": "31 %",
      "Official Language": "Arabic and Berber. French and English are widely used, and 25% speak one of the Berber languages",
      "Languages": "20",
      "Literacy Rate": "80 %",
      "Life Expectancy": "76.4 yrs (76/236)",
      "HDI Ranking": "91 / 189",
      "% Christian": "0.3 %",
      "% Evangelical": "0.2 %",
      "Largest Religion": "Muslim",
      "% Largest Religion": "97.3 %",
      "People Groups": "37",
      "Least Reached People Groups": "34",
      "% Unevangelized": "59 %",
      "Persecution Ranking": "20 / 50"
    },
  },
  IR: {
    name: 'Iran',
    source: 'https://operationworld.org/locations/iran',
    summary: 'Massive numbers of Iranians have come to Jesus in recent years! From only 500 Muslim-background believers in 1979, some estimates suggest the number is even greater than 1 million just in Iran alone. Large numbers of Persian people have also encountered the risen Christ outside of Iran. While hundreds of thousands of Iranians have indicated that they are Christian, only a fraction actively participate in church life. Even so, the Church in Persia has not grown this fast since the 7th century. In Iran, a person can receive a death sentence for apostasy (abandoning religious faith). Despite this, 50,000 mosques have closed in recent years as Iranians are disillusioned with both the regime and with Islam. This growth is a remarkable move of the Holy Spirit, with many signs and wonders, dreams and visions.',
    prayerAnswers: [
      'Massive numbers of Iranians have come to Jesus in recent years! From only 500 Muslim-background believers in 1979, some estimates suggest the number is even greater than 1 million just in Iran alone. Large numbers of Persian people have also encountered the risen Christ outside of Iran. While hundreds of thousands of Iranians have indicated that they are Christian, only a fraction actively participate in church life. Even so, the Church in Persia has not grown this fast since the 7th century. In Iran, a person can receive a death sentence for apostasy (abandoning religious faith). Despite this, 50,000 mosques have closed in recent years as Iranians are disillusioned with both the regime and with Islam. This growth is a remarkable move of the Holy Spirit, with many signs and wonders, dreams and visions.',
      'The 1979 Islamic Revolution promised peace and prosperity, but more than 40 years later, we may be witnessing the collapse of the regime. Widespread protests in 2022 and 2026 demonstrated that the younger generation is fed up with the legacy of oppression, bloodshed, cruel ‘justice’, corruption, economic hardship, and cultural isolation from most of the world. Despite external religiosity, drug addiction, and prostitution are widespread. Iran is an ancient, noble, and proud civilization. But in the modern era, these struggles have made many people very open to the gospel. Many others are turning to atheism or to Iran’s ancient religion, Zoroastrianism. Pray that Iranians’ desires for greatness, prosperity, freedom, and even for righteousness might ultimately be met through worship of Jesus.',
      'Iran contains some of the largest unreached, unengaged peoples in the world. Missions are not free to minister in Iran, but some tentmaking opportunities exist. Pray for the door to Iran to open in God’s perfect timing.',
    ],
    prayerChallenges: [
      'The Zoroastrians (Parsees) follow an ancient Persian religion founded 1,000, years before Christ.',
      'The Baha’i religion started in Iran, but the government seeks to drive its followers out. Very little Christian love and witness to them exists among either the 300,000 in Iran, or the 5-7 million worldwide.',
      'The nomadic and semi-nomadic Luri, Bakhtiari, and Qashqai live in the Zagros Mountains. Only a few dozen known believers exist from these groups. Persian Christians have begun to reach out to them.',
      'The Turkic Azeri and Turkmen in the north have had almost no positive contact with Christianity. Azeris form the largest minority group within Iran.',
      'The Gypsy communities have no Christian workers committed to outreach among them.',
      'The Persian-speaking Jews descend from those exiled to Babylon 2,700 years ago. Their numbers decline as more and more move away to escape harassment, but a number have become active, witnessing Christians!',
    ],
    stats: {
      "Continent": "Asia",
      "Capital": "Tehran",
      "Population": "92,418,000",
      "% Urban": "78.1 %",
      "Population Under 15 Yrs": "25 %",
      "Official Language": "Persian (Farsi; Dari and Tajik are major dialects); almost all Iranians speak some form of Persian as a mother tongue or second language",
      "Languages": "78",
      "Literacy Rate": "85 %",
      "Life Expectancy": "73.9 yrs (108/236)",
      "HDI Ranking": "76 / 189",
      "% Christian": "0.5 %",
      "% Evangelical": "0.2 %",
      "Largest Religion": "Muslim",
      "% Largest Religion": "98.6 %",
      "People Groups": "91",
      "Least Reached People Groups": "85",
      "% Unevangelized": "65 %",
      "Persecution Ranking": "10 / 50"
    },
  },
  TM: {
    name: 'Turkmenistan',
    source: 'https://operationworld.org/locations/turkmenistan',
    summary: 'Hostility against almost any foreign Christian activity or even presence has persisted for over 30 years. Almost every foreign Christian has been expelled. Several national pastors have been exiled, beaten, heavily fined or imprisoned. The twenty or so registered congregations continue to be intimidated and forbidden to meet. Registration is a difficult, near-impossible process, and when it does occur, it only subjects the church to greater surveillance. Pray for a softening of the attitude of the authorities, for courage for Christians in Turkmenistan to stand firm and for Christians outside of the country to pray and speak up against these hostile actions.',
    prayerAnswers: [
      'Hostility against almost any foreign Christian activity or even presence has persisted for over 30 years. Almost every foreign Christian has been expelled. Several national pastors have been exiled, beaten, heavily fined or imprisoned. The twenty or so registered congregations continue to be intimidated and forbidden to meet. Registration is a difficult, near-impossible process, and when it does occur, it only subjects the church to greater surveillance. Pray for a softening of the attitude of the authorities, for courage for Christians in Turkmenistan to stand firm and for Christians outside of the country to pray and speak up against these hostile actions.',
    ],
    prayerChallenges: [],
    stats: {
      "Continent": "Asia",
      "Capital": "Ashgabat",
      "Population": "7,619,000",
      "% Urban": "55.1 %",
      "Population Under 15 Yrs": "31 %",
      "Official Language": "Turkmen using Latin script as in Turkey since 1994; previously Cyrillic script",
      "Languages": "8",
      "Literacy Rate": "100 %",
      "Life Expectancy": "69.3 yrs (169/236)",
      "HDI Ranking": "91 / 189",
      "% Christian": "1.8 %",
      "% Evangelical": "0 %",
      "Largest Religion": "Muslim",
      "% Largest Religion": "96.2 %",
      "People Groups": "28",
      "Least Reached People Groups": "20",
      "% Unevangelized": "63 %",
      "Persecution Ranking": "35 / 50"
    },
  },
  SD: {
    name: 'Sudan',
    source: 'https://operationworld.org/locations/sudan',
    summary: 'Catastrophe is not too strong a word to describe Sudan’s current status. Massive protests in 2018 eventually led to the arrest of the President and the end of his rule, 30 years after he seized power in a military coup. A transitional military-civilian government was formed in 2019, but this brief hope for progress was undone by subsequent military coups. Now, civil war rages between the Sudan Armed Forces and the Rapid Support Forces which was formed from government-supported paramilitaries. The millions of Sudanese who want neither of these forces to rule them have been subjected to atrocities by both sides. Over 10 million Sudanese are displaced, and famine – especially in Darfur – reaches out to claim more lives. Pray that the legacy of oppressive, militaristic rule in Sudan might be ended in Jesus’ name. Pray for a government that will oversee a flourishing of the country – most importantly through the rapid spread of the gospel.',
    prayerAnswers: [
      'Catastrophe is not too strong a word to describe Sudan’s current status. Massive protests in 2018 eventually led to the arrest of the President and the end of his rule, 30 years after he seized power in a military coup. A transitional military-civilian government was formed in 2019, but this brief hope for progress was undone by subsequent military coups. Now, civil war rages between the Sudan Armed Forces and the Rapid Support Forces which was formed from government-supported paramilitaries. The millions of Sudanese who want neither of these forces to rule them have been subjected to atrocities by both sides. Over 10 million Sudanese are displaced, and famine – especially in Darfur – reaches out to claim more lives. Pray that the legacy of oppressive, militaristic rule in Sudan might be ended in Jesus’ name. Pray for a government that will oversee a flourishing of the country – most importantly through the rapid spread of the gospel.',
      'The gospel spread through these many years of upheaval. Although the conflicts created terrible suffering, they made the Church more mature. The wars scattered Christian refugees throughout the country, so even through suffering the good news spread. Churches formed in places and among peoples that previously had no Christians! Praise God that this growth occurs across many denominations. Pray for them to find unity through Christ. The Islamic government bombed churches and other Christian buildings in the South, and specifically targeted Christian areas for attack. But many believers kept their faith, and even took the gospel to other ethnic groups during these hard times!',
    ],
    prayerChallenges: [],
    stats: {
      "Continent": "Africa",
      "Capital": "Khartoum",
      "Population": "51,662,000",
      "% Urban": "37.2 %",
      "Population Under 15 Yrs": "40 %",
      "Official Language": "Arabic and English",
      "Languages": "80",
      "Literacy Rate": "72 %",
      "Life Expectancy": "65.3 yrs (191/236)",
      "HDI Ranking": "172 / 189",
      "% Christian": "5 %",
      "% Evangelical": "2.5 %",
      "Largest Religion": "Muslim",
      "% Largest Religion": "91.7 %",
      "People Groups": "198",
      "Least Reached People Groups": "168",
      "% Unevangelized": "64 %",
      "Persecution Ranking": "4 / 50"
    },
  },
  MV: {
    name: 'Maldives',
    source: 'https://operationworld.org/locations/maldives',
    summary: 'Tourists see the Maldives as an island paradise, but a darker reality hides below the surface. Powerful social and official forces limit freedom of expression and belief. The Maldives has one of the highest divorce rates in the world. Crime rates and gang activity both continue to rise. Child abuse and teenage drug abuse (among up to 70% of teens) indicate deep problems. Islam is the only recognized religion, and the government forbids open practice of all other religions. But beyond Islamic beliefs, many people follow occult practices called fanditha. Pray for the light of the gospel to shine among Maldivians. Pray against strongholds of pride, fear, and selfish pursuit of physical pleasures.',
    prayerAnswers: [
      'Tourists see the Maldives as an island paradise, but a darker reality hides below the surface. Powerful social and official forces limit freedom of expression and belief. The Maldives has one of the highest divorce rates in the world. Crime rates and gang activity both continue to rise. Child abuse and teenage drug abuse (among up to 70% of teens) indicate deep problems. Islam is the only recognized religion, and the government forbids open practice of all other religions. But beyond Islamic beliefs, many people follow occult practices called fanditha. Pray for the light of the gospel to shine among Maldivians. Pray against strongholds of pride, fear, and selfish pursuit of physical pleasures.',
    ],
    prayerChallenges: [],
    stats: {
      "Continent": "Asia",
      "Capital": "Mal\u00e9",
      "Population": "530,000",
      "% Urban": "42.8 %",
      "Population Under 15 Yrs": "20 %",
      "Official Language": "Dhivehi (dialect of Sinhala, script derived from Arabic)",
      "Languages": "2",
      "Literacy Rate": "98 %",
      "Life Expectancy": "79.9 yrs (46/236)",
      "HDI Ranking": "90 / 189",
      "% Christian": "0.2 %",
      "% Evangelical": "0.1 %",
      "Largest Religion": "Muslim",
      "% Largest Religion": "99 %",
      "People Groups": "4",
      "Least Reached People Groups": "4",
      "% Unevangelized": "76 %",
      "Persecution Ranking": "19 / 50"
    },
  },
  KM: {
    name: 'Comoros',
    source: 'https://operationworld.org/locations/comoros',
    summary: 'The vast majority of the population are Muslim. They were almost completely unevangelized before 1973. Islamic fundamentalism is on the rise. However, most are involved in occult practices through witchcraft, curses and spirit possession. Many young people – disillusioned with life in this society that offers so little hope – attempt to find solace in drugs, sex or the opportunity to leave the islands. Pray that they might have opportunities to hear the gospel of life that offers hope to all.',
    prayerAnswers: [
      'The vast majority of the population are Muslim. They were almost completely unevangelized before 1973. Islamic fundamentalism is on the rise. However, most are involved in occult practices through witchcraft, curses and spirit possession. Many young people – disillusioned with life in this society that offers so little hope – attempt to find solace in drugs, sex or the opportunity to leave the islands. Pray that they might have opportunities to hear the gospel of life that offers hope to all.',
    ],
    prayerChallenges: [],
    stats: {
      "Continent": "Africa",
      "Capital": "Moroni",
      "Population": "883,000",
      "% Urban": "30.7 %",
      "Population Under 15 Yrs": "39 %",
      "Official Language": "Arabic, French, Comorian (a mix of Swahili and Arabic)",
      "Languages": "7",
      "Literacy Rate": "76 %",
      "Life Expectancy": "63.4 yrs (201/236)",
      "HDI Ranking": "156 / 189",
      "% Christian": "0.9 %",
      "% Evangelical": "0.2 %",
      "Largest Religion": "Muslim",
      "% Largest Religion": "98.8 %",
      "People Groups": "7",
      "Least Reached People Groups": "5",
      "% Unevangelized": "66 %",
      "Persecution Ranking": "43 / 50"
    },
  },
  TN: {
    name: 'Tunisia',
    source: 'https://operationworld.org/locations/tunisia',
    summary: 'The Arab Spring began in Tunisia (December 2010). The country had one of the most progressive and open societies in the Arab world, but Tunisians felt frustrated by high unemployment, corruption, political oppression, and poor living conditions. Protests led to government changes, and inspired similar protests across the whole Arab world. However, continued economic decline and unemployment, the increasing presence of Islamic fundamentalism, and a heavy-handed President (who rewrote the constitution to give himself more power) all serve to rob Tunisians of confidence in their country’s future. Pray that the travails of Tunisia might somehow draw people towards Christ.',
    prayerAnswers: [
      'The Arab Spring began in Tunisia (December 2010). The country had one of the most progressive and open societies in the Arab world, but Tunisians felt frustrated by high unemployment, corruption, political oppression, and poor living conditions. Protests led to government changes, and inspired similar protests across the whole Arab world. However, continued economic decline and unemployment, the increasing presence of Islamic fundamentalism, and a heavy-handed President (who rewrote the constitution to give himself more power) all serve to rob Tunisians of confidence in their country’s future. Pray that the travails of Tunisia might somehow draw people towards Christ.',
    ],
    prayerChallenges: [],
    stats: {
      "Continent": "Africa",
      "Capital": "Tunis",
      "Population": "12,349,000",
      "% Urban": "71.2 %",
      "Population Under 15 Yrs": "24 %",
      "Official Language": "Arabic. French widely used but declining as English increases",
      "Languages": "6",
      "Literacy Rate": "79 %",
      "Life Expectancy": "73.8 yrs (111/236)",
      "HDI Ranking": "97 / 189",
      "% Christian": "0.2 %",
      "% Evangelical": "0 %",
      "Largest Religion": "Muslim",
      "% Largest Religion": "99.4 %",
      "People Groups": "18",
      "Least Reached People Groups": "16",
      "% Unevangelized": "60 %",
      "Persecution Ranking": "31 / 50"
    },
  },
  TJ: {
    name: 'Tajikistan',
    source: 'https://operationworld.org/locations/tajikistan',
    summary: 'Although Islam is the religion of 94% of the population, only a small fraction practice “pure” Islam. Most are more influenced by folk superstitions and Zoroastrian beliefs. Mosques sprouted up everywhere in the years following independence, but now the government places severe restrictions on mosque building. Tajikistan’s proximity to Iran and Afghanistan makes it vulnerable to Islamism. Pray for extremism to be restrained, and that Muslims might have unprecedented opportunities to discover Christ.',
    prayerAnswers: [
      'Although Islam is the religion of 94% of the population, only a small fraction practice “pure” Islam. Most are more influenced by folk superstitions and Zoroastrian beliefs. Mosques sprouted up everywhere in the years following independence, but now the government places severe restrictions on mosque building. Tajikistan’s proximity to Iran and Afghanistan makes it vulnerable to Islamism. Pray for extremism to be restrained, and that Muslims might have unprecedented opportunities to discover Christ.',
    ],
    prayerChallenges: [],
    stats: {
      "Continent": "Asia",
      "Capital": "Dushanbe",
      "Population": "10,787,000",
      "% Urban": "28.8 %",
      "Population Under 15 Yrs": "37 %",
      "Official Language": "Tajik",
      "Languages": "13",
      "Literacy Rate": "99 %",
      "Life Expectancy": "71.6 yrs (140/236)",
      "HDI Ranking": "122 / 189",
      "% Christian": "1 %",
      "% Evangelical": "0.1 %",
      "Largest Religion": "Muslim",
      "% Largest Religion": "93.9 %",
      "People Groups": "29",
      "Least Reached People Groups": "25",
      "% Unevangelized": "56 %",
      "Persecution Ranking": "27 / 50"
    },
  },
};

// ── Name → ISO fallback for records without a clean isoCode ──────────────────
const _NAME_TO_ISO = {
  'somalia':'SO','afghanistan':'AF','yemen':'YE',
  'north korea':'KP','korea, north':'KP','korea, democratic peoples republic of':'KP',
  'mauritania':'MR','eritrea':'ER','libya':'LY','algeria':'DZ',
  'iran':'IR','iran, islamic republic of':'IR',
  'turkmenistan':'TM','sudan':'SD','maldives':'MV','comoros':'KM',
  'tunisia':'TN','tajikistan':'TJ',
};

// Look up Operation World data by ISO 3166-1 alpha-2 or by country name.
export function owLookup(isoCode, countryName) {
  const iso = String(isoCode || '').trim().toUpperCase();
  if (iso.length === 2 && OW_DATA[iso]) return { iso, ...OW_DATA[iso] };
  const nm = String(countryName || '').trim().toLowerCase();
  if (nm) {
    const mapped = _NAME_TO_ISO[nm];
    if (mapped && OW_DATA[mapped]) return { iso: mapped, ...OW_DATA[mapped] };
  }
  return null;
}
