# DDD-2025-Group1-NewDelivery
Chiara Baldini, Melanie Turano, Zeno Tamagni

## Title of the project
**Clear Skies, Clear Signs?**

_The Impact of Weather on UFO Sightings_


## Project Brief
**Overview & Research Question**

For decades, the UFO phenomenon has captured the public imagination, generating thousands of reports worldwide. However, how much do environmental factors influence these testimonies?

Our research stems from a fundamental question:

_**"How might we visualize correlations between UFO sightings and environmental conditions to examine how weather and atmospheric visibility influence perception?"**_

To investigate this relationship and understand whether people perceive (or believe they see) more UFOs based on specific atmospheric conditions, we isolated a significant reference year: 2012. We cross-referenced a vast historical database of global sightings with actual, pinpoint weather data for those exact days. The result is a hybrid dataset, processed and structured specifically to visually and intuitively explore how "weather" and human perception intersected throughout that year.



## Data Collection
**Where did you get your data from?**



**What’s your data about?**
The project aims to explore our research question: Do weather conditions and sky visibility influence the perception and the number of recorded UFO sightings? To answer this, we started with the global historical dataset and enriched it with weather data. To keep the analysis focused and high-performing, we chose the year 2012, aggregating and reducing the massive amount of data into monthly and daily windows to analyze the relationship between sighting frequency and the specific weather of those days.

**Who is/are the sources/creators of your data?**
Our final dataset is the result of a hybrid approach that combines a historical archive with historical weather data. The two main sources are:

Kaggle: We used a comprehensive aggregated dataset containing over 80,000 historical UFO sighting reports from various global sources.

Open-Meteo API: To enrich the sightings data, we relied on this open-source API to retrieve historical weather data corresponding to the exact coordinates and dates of the reported events.



## Data Organisation
**Have you combined data from different sources? How did you merge them?**
Absolutely. The process required a careful data merging phase. We started with the Kaggle macro-dataset (over 80,000 records) and used the dates and locations of the sightings as search keys to query the Open-Meteo API. Once the corresponding weather data was extracted, we merged the two information streams. Finally, we filtered everything for the year 2012 and structured the result into a single, optimized JSON file ready for the visualization phase.


**What columns are more relevant for your project?**
To maintain focus on our research, the most crucial variables (columns) extracted from the combined dataset are three:

• **Country (or Geographic Area):** To spatially map the events.
• **Sighting_Count:** The quantitative metric to understand the frequency of the events.
• **Sky_Condition / Weather:** The fundamental parameter for our correlation analysis (e.g., clear, cloudy, rain, visibility).


**Have you used any AI-based tool to understand or manipulate your data? if yes, what and how**
Yes, to optimize the data wrangling and synthesis process, we integrated Google AI Studio. Artificial intelligence supported us in summarizing and structuring the massive initial dataset (the original 80,000 records), facilitating the extraction of the relevant variables.



## Data visualisation
**Data visualisation description**

**Insights**



**Diagram Protocol**

```mermaid
---
Title: DDD Project process - Chiara Baldini, Melanie Turano, Zeno Tamagni
---

flowchart TD
Start[Brief] --> Research1{Research on internet}
Research1 -.-> Topic1[Image of aliens over the years]
Research1 -.-> Topic2[UFO]
Research1 ---> Topic3[Relationship between religion and extraterrestrial life]
Topic3 --> GeneralQuestion([What social transformations would follow in the discovery of a connection between the divine and extraterrestrial civilizations?])
GeneralQuestion --> Research2{Internet Research}
Research2 --> Topic4[Alien in history]
Research2 --> Topic5[Mauro Biglinos Theories]
Research2 --> Topic6[Ancient astronauts theory]
Research2 --> Topic7[UFO religion]
Topic5 --> BiglinoAnalysis[Analysis of Biglinos book La Bibbia non parla di Dio]
BiglinoAnalysis --> Theories{{Biglino argues that the current theological interpretation of the Old Testament has been piloted over the years and that, if one analyzes the original Hebrew text, the narrative that emerges is markedly different}}
Theories --> Bible[Investigation related to current theological interpretations]
Theories --> Terms{{Many terms would suggest that God are actually multiple extraterrestrial figures who have come to Earth numerous times throughout history}}
Theories --> AI1((Using AI tools to help understand the most relevant words in Biglino search))
Theories --> AI2((Using AI tools to help us combine Biglino's interpretations with classical theological interpretations))
Terms --> SpecificQuestion([Are there elements within the Hebrew version of the Old Testament that suggest that God is not actually a spiritual being but an extraterrestrial being?])
SpecificQuestion --> GeneralQuestion
Topic6 --> Statement{{Theories that hypothesize contact between aliens and ancient civilizations such as the Sumerians and Egyptians}}
Statement --> Theories 
Topic7 --> Belief{{Faith that believes that aliens visit Earth via UFOs and are capable of intervening on the human population with the aim of allowing humans to live well}}
SpecificQuestion --> DatasetCreation[(Dataset)]
Bible --> DatasetCreation
AI1 --> DatasetCreation
AI2 --> DatasetCreation
DatasetCreation --> TermsColumn[/Relevant Terms chosen\]
DatasetCreation --> TraditionalColumn[/Traditional Interpretation\]
DatasetCreation --> BiglinoColumn[/Biglinos Interpretation\]
DatasetCreation --> ThemeColumn[/Topic of term\]
DatasetCreation --> BiblicalColumn[/Biblical reference: Book, Chapter, Verse\]
TermsColumn --> DataViz[[Data visualisation creation starting from a Bubblechart combined with a Linear Dendogram]]
TraditionalColumn --> DataViz[[Data visualisation creation starting from a Bubblechart combined with a Linear Dendogram]]
BiglinoColumn --> DataViz[[Data visualisation creation starting from a Bubblechart combined with a Linear Dendogram]]
ThemeColumn --> DataViz[[Data visualisation creation starting from a Bubblechart combined with a Linear Dendogram]]
BiblicalColumn --> DataViz[[Data visualisation creation starting from a Bubblechart combined with a Linear Dendogram]]
DataViz --> Explanation1{{This visualization reinterprets sacred Hebrew terms through a contemporary, tech-inspired lens, transforming religious language into a speculative, hierarchical concept map.}}
DataViz -.-> Notrealised1[[Alluvial diagram]]
DataViz -.-> Notrealised2[[Circle Packing]]
DataViz -.-> Notrealised3[[Chord Diagram]]
DataViz --> Website
Website --> Explanation2{{The website documents the project, providing access to the visualization, dataset, resources, and its aesthetic context.}}

style Topic1 fill:#ffa500;
style Topic2 fill:#ffa500;
style GeneralQuestion fill:#008b8b;
style Theories fill:#ffd1dc;
style Statement fill:#ffd1dc;
style Belief fill:#ffd1dc;
style Terms fill:#ffd1dc;
style AI1 fill:#fffeef;
style AI2 fill:#fffeef;
style DatasetCreation fill:#874dbf;
style TermsColumn fill:#cbb8b7;
style TraditionalColumn fill:#cbb8b7;
style BiglinoColumn fill:#cbb8b7;
style ThemeColumn fill:#cbb8b7;
style BiblicalColumn fill:#cbb8b7;
style SpecificQuestion fill:#008b8b;
style Notrealised1 fill:#d7d7d7;
style Notrealised1 stroke:#d7d7d7;
style Notrealised2 stroke-dasharray: 5 5, fill:#ffa500;
style Notrealised3 stroke-dasharray: 5 5, fill:#ffa500;
style DataViz fill:#874dbf;
style Explanation1 fill:#ffd1dc;
style Explanation2 fill:#ffd1dc;
