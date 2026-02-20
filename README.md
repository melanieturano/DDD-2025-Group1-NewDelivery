# DDD-2025-Group1-NewDelivery
Chiara Baldini, Melanie Turano, Zeno Tamagni

## Title of the project
**Clear Skies, Clear Signs?**

_The Impact of Weather on UFO Sightings_

Project link Figma: https://www.figma.com/design/8Dx8lQeiphQ76MBRV3kX17/Untitled?node-id=0-1&t=FCiNebnfGFxLGf3K-1


## Project Brief

**Overview & Research Question**

For decades, the UFO phenomenon has captured the public imagination, generating thousands of reports worldwide. However, how much do environmental factors influence these testimonies?

Our research stems from a fundamental question:

_**"How might we visualize correlations between UFO sightings and environmental conditions to examine how weather and atmospheric visibility influence perception?"**_

To investigate this relationship and understand whether people perceive (or believe they see) more UFOs based on specific atmospheric conditions, we isolated a significant reference year: 2012. We cross-referenced a vast historical database of global sightings with actual, pinpoint weather data for those exact days. The result is a hybrid dataset, processed and structured specifically to visually and intuitively explore how "weather" and human perception intersected throughout that year.



## Data Collection
**Where did you get your data from?**

- https://countriesnow.space/api/v0.1/countries
- https://archive-api.open-meteo.com/v1/archive
- https://www.kaggle.com/datasets/sahityasetu/ufo-sightings
- https://www.archives.gov/research/topics/uaps
- https://www.britannica.com/topic/unidentified-flying-object



**What’s your data about?**

The project aims to explore our research question: Do weather conditions and sky visibility influence the perception and the number of recorded UFO sightings? To answer this, we started with the global historical dataset and enriched it with weather data. To keep the analysis focused and high-performing, we chose the year 2012, aggregating and reducing the massive amount of data into monthly and daily windows to analyze the relationship between sighting frequency and the specific weather of those days.

**Who is/are the sources/creators of your data?**

Our final dataset is the result of a hybrid approach that combines a historical archive with historical weather data. The two main sources are:

Kaggle: We used a comprehensive aggregated dataset containing over 80,000 historical UFO sighting reports from various global sources.

Open-Meteo API: To enrich the sightings data, we relied on this open-source API to retrieve historical weather data corresponding to the exact coordinates and dates of the reported events.



## Data Organisation
**Have you combined data from different sources? How did you merge them?**

The process required a careful data merging phase. We started with the Kaggle macro-dataset (over 80,000 records) and used the dates and locations of the sightings as search keys to query the Open-Meteo API. Once the corresponding weather data was extracted, we merged the two information streams. Finally, we filtered everything for the year 2012 and structured the result into a single, optimized JSON file ready for the visualization phase. Dataset reduction work was required throughout the project. Many of the data we used represent an average of a given feature over a given period (e.g. average weather conditions for January 2012 in Canada).


**What columns are more relevant for your project?**

To maintain focus on our research, the most crucial variables (columns) extracted from the combined dataset are three:

• **Country (or Geographic Area):** To spatially map the events.
• **Sighting_Count:** The quantitative metric to understand the frequency of the events.
• **Sky_Condition / Weather:** The fundamental parameter for our correlation analysis (e.g., clear, cloudy, rain, visibility).


**Have you used any AI-based tool to understand or manipulate your data? if yes, what and how**

Yes, to optimize the data wrangling and synthesis process, we integrated Google AI Studio. Artificial intelligence supported us in summarizing and structuring the massive initial dataset (the original 80,000 records), facilitating the extraction of the relevant variables. 

**Dataset link**
https://docs.google.com/spreadsheets/d/18ZN4f5_oZRyKbPCFyr8tjh_a5oHMh-amvW1jfpoRoMU/edit?usp=sharing
https://docs.google.com/spreadsheets/d/1xMLqIReSESHn3ojaJo9LaCiJYzlLHo7nMDsQVLkTA0w/edit?usp=sharing



## Data visualisation
**Data visualisation description**

The final result is actually composed of two different visualizations, the first: broader but focused on the visualization of possible patterns that relate sightings and weather conditions, and the second: focused only a more specific portion of data related to environmental conditions but interesting to us.

Visualisation 1: It relates months, countries, weather conditions, and shapes of UFO sightings in 2012, highlighting recurring patterns across time and space.In this case, the portion of data taken into consideration is larger but always chosen according to the functionality of the visualization. The year 2012 was chosen because it had the most sightings recorded so far and the countries relevant for data importance were selected. 

Visualisation 2: We wanted to include the second visualization to explore data that, almost to the end, we left in the background but also to be able to provide a focus on the United States, a country with a lot of data to work on. In this second visualization we asked whether the total amount of sightings, latitude, and duration of the sighting were somehow related to understand whether, observation distance, and duration play a role in what people see and how they interpret it
![Cover v0 04-2](https://github.com/user-attachments/assets/955056f5-f576-4c86-9ed2-a336d27b3179)


**Insights**

**Visualisation 1:**

- According to our visualization, weather conditions do not have a major influence on what people see and interpret as UFO phenomena. It's clear that sky conditions aren't important; even overcast skies don't compromise people's visibility, confusing them. 
- People are drawn to what they see in the sky regardless of weather conditions. The number of sightings shows how, at least for American citizens, interest in this type of phenomenon is constant over time.
- While there may be adverse weather conditions, people easily identify the generic shape and characteristics of what they see, making the sighting likely more real to the beholder
- The United States dominates in terms of number of sightings (and this is a trend that, if you look at the dataset in its entirety, is constant). Other recurrent countries are Canada and the United Kingdom. We asked ourselves why the United States has such a large number of sightings: we don't have a definitive answer because this wasn't the focus of the visualization, but we believe that cultural and social factors, as well as the massive presence of government structures, can influence this number. Furthermore, in the United States, the archiving (through official government channels or not) of UFO sightings is much more present than in other states and this is demonstrated by the ease with which it is easy to find data on the USA.
![Cover v0 04](https://github.com/user-attachments/assets/19021c2a-3bcc-4a84-93e0-abfa916b481b)

**Visualisation 2:**
- The average latitude between states appears to be constant, consequently this environmental factor does not affect the perception of a sighting.
- States with the highest number of sightings do not necessarily have the longest average duration of them. California, for example, the country with the highest number of sightings, is surpassed by the Missipi with a duration of more than double, a similar latitude but a significantly lower number of sightings. This trend can also be seen when comparing other States. One wonders therefore whether, the quantity of the number of sightings, is so important in the search for trends.
- In July 2012 alone, the number of sightings in the United States was extremely high. The states that, by area, are larger, are also those with the highest sightings. Alaska makes exceptions but we believe this is because, although it is the largest state by area, it is probably also the least densely populated.
![Cover v0 04-1](https://github.com/user-attachments/assets/07af991e-f9de-4384-acca-4e329c13148c)

**Diagram Protocol**

```mermaid
---
Title: DDD Project process - Chiara Baldini, Melanie Turano, Zeno Tamagni
---

flowchart TD
Start[Brief] --> Research1{Brainstorming}
Research1 -.-> Topic1[Space missions]
Research1 -.-> Topic2[Evolution of the representation of the alien figure]
Research1 ---> Topic3[Frequency of UFO sightings over time]
Research1 -.-> Topic4[Meteorites on Earth]
Research1 -.-> Topic5[News about alien in social media]
Topic3 --> Research2{Internet Research}
Research2{Internet Research} --> UFO1[UFO Definition]
Research2{Internet Research} --> UFO2[UFO Sightings history]
Research2{Internet Research} --> UFO3[UFO Sightings archives]
Research2{Internet Research} --> UFO4[UFO Sighthings dataset]
UFO3[UFO Sightings archives] --> Insight1{{The most extensive archives are American}}
UFO4[UFO Sighthings dataset] --> Tool1((Kaggle))
Tool1 --> Insight1{{Most kaggle dataset are based on American archives}}
Tool1 --> Dataset1[(Premade Dataset of UFO sightings)]
Dataset1[(Premade Dataset of UFO sightings)] --> Research3{Internet Research for weather data}
Research3{Internet Research for weather data} --> Tool2((API))
Tool2((API)) --> Tool3((Webapp with API))
Tool3{Webapp with API} --> Tool4((JSON with weather data))
Tool4((JSON with weather data)) --> Merge{Merge Original dataset with JSON} 
Merge{Merge Original dataset with JSON} --> AItool((+AI)) 
Merge{Merge Original dataset with JSON} --> Dataset2[(Final Dataset)]
AItool((+AI - used just to help with merging, not for interpretation)) --> Dataset2[(Final Dataset)]
Dataset2[(Final Dataset)] --> Column1[/Sightings date: GG,MM, YYYY + time\]
Dataset2[(Final Dataset)] --> Column2[/Sightings place: Country, Region, Locality\]
Dataset2[(Final Dataset)] --> Column3[/Latitude\]
Dataset2[(Final Dataset)] --> Column4[/Longitude\]
Dataset2[(Final Dataset)] --> Column5[/UFO shape\]
Dataset2[(Final Dataset)] --> Column6[/Encounter duration\]
Dataset2[(Final Dataset)] --> Column7[/Sighting description\]
Dataset2[(Final Dataset)] --> Column8[/Weather conditions\]
Dataset2[(Final Dataset)] --> Column9[/Temperature\]
Column1[/Sightings date: GG,MM, YYYY + time\] -->  Dataviz1[[Data Visualisation 1]]
Column2[/Sightings place: Country, Region, Locality\] -->  Dataviz1[[Data Visualisation 1]]
Column8[/Weather conditions\] -->  Dataviz1[[Data Visualisation 1]]
Column9[/Temperature\] -->  Dataviz1[[Data Visualisation 1]]
Column3[/Latitude\] -->  Dataviz2[[Data Visualisation 2]]
Column8[/Weather conditions\] -->  Dataviz2[[Data Visualisation 2]]
Column1[/Sightings date: GG,MM, YYYY + time\] -->  Dataviz2[[Data Visualisation 2]]
Column2[/Sightings place: Country, Region, Locality\] -->  Dataviz2[[Data Visualisation 2]]
Dataviz1[[Data Visualisation 1]] --> Graph1[Matrix plot + Linear dendogram]
Dataviz2[[Data Visualisation 2]] --> Graph2[Treemap]
Graph1[Matrix plot + Linear dendogram] --> Insight2{{Weather: minimal influence}}
Graph1[Matrix plot + Linear dendogram] --> Insight3{{Interest constant}}
Graph1[Matrix plot + Linear dendogram] --> Insight4{{Shapes easily recognized}}
Graph1[Matrix plot + Linear dendogram] --> Insight5{{USA dominant: cultural + data collection factors?}}
Graph2[Treemap] --> Insight6{{Latitude: irrelevant}}
Graph2[Treemap] --> Insight7{{Number ≠ duration}}
Graph2[Treemap] --> Insight8{{July peak + larger states more sightings}}


style Topic1 fill:#d7d7d7;
style Topic2 fill:#d7d7d7;
style Topic4 fill:#d7d7d7;
style Topic5 fill:#d7d7d7;
