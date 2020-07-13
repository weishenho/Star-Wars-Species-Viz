import React, { useEffect, useState } from "react";
import "./App.css";
import { Dropdown } from "semantic-ui-react";
import * as _ from "lodash";
import ReactEcharts from "echarts-for-react";

interface People {
  name: string;
  height: string;
  mass: string;
  gender: string;
}

interface SpeciesOptions {
  key: string;
  text: string;
  value: string;
}

interface Species {
  name: string;
  people: string[];
}

const urlToHttps = (url: string) => {
  if (url.match("^http://")) {
    url = url.replace("http://", "https://");
  }
  return url;
};

const useFetchAllSpecies = () => {
  const [speciesData, setSpeciesData] = useState<Species[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    async function fetchSpecies() {
      try {
        let newSpeciesData: Species[] = [];
        let result = await fetch("https://swapi.dev/api/species/");
        let data = await result.json();

        newSpeciesData = newSpeciesData.concat(data.results);

        while (data.next) {
          let url = urlToHttps(data.next);
          result = await fetch(url);
          data = await result.json();
          newSpeciesData = newSpeciesData.concat(data.results);
        }
        console.log("fetchSpecies");
        setSpeciesData(newSpeciesData);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    }

    fetchSpecies();
    setLoading(false);
  }, []);

  return { speciesData, loading };
};

function App() {
  const { speciesData, loading: loadingFetchAllSpecies } = useFetchAllSpecies();

  const [speciesOptions, setSpeciesOptions] = useState<SpeciesOptions[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState<People[]>([]);

  useEffect(() => {
    if (Array.isArray(speciesData) && speciesData.length > 0) {
      const newSpeciesOptions = speciesData.map((item: { name: string }) => ({
        key: item.name,
        text: item.name,
        value: item.name,
      }));

      setSpeciesOptions(newSpeciesOptions);
    }
  }, [speciesData]);

  const onOptionSelected = async (value: string) => {
    try {
      const x: Species | undefined = _.find(speciesData, { name: value });
      if (x) {
        const fetchPeople = x.people.map((url: string) =>
          fetch(urlToHttps(url))
        );
        const peopleData: Response[] = await Promise.all(fetchPeople);
        const peopleResult: People[] = await Promise.all(
          peopleData.map((v: Response) => v.json())
        );
        setSelectedSpecies(peopleResult);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // chart options
  const option = {
    backgroundColor: {
      type: "linear",
      x: 0,
      y: 0,
      x2: 1,
      y2: 1,
      colorStops: [
        {
          offset: 0,
          color: "#2c343c",
        },
        {
          offset: 1,
          color: "#051937", // color at 100% position
        },
      ],
      global: false, // false by default
    },
    title: {
      text: "Star Wars Species",
      left: "center",
      top: 20,
      textStyle: {
        fontSize: 30,
        color: "#cfcfcf",
      },
    },
    xAxis: {
      type: "value",
      name: selectedSpecies.length > 0 ? "Height" : "",
      nameTextStyle: {
        color: "#f2f2f2",
        fontWeight: "bold",
      },
      boundaryGap: false,
      axisLabel: {
        margin: 30,
        color: "#ffffff63",
      },
      axisLine: {
        show: false,
      },
      axisTick: {
        show: true,
        length: 25,
        lineStyle: {
          color: "#ffffff1f",
        },
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: "#ffffff1f",
        },
      },
      max: function (value: any) {
        return Math.ceil(value.max * 1.03);
      },
    },
    yAxis: {
      type: "value",
      name: selectedSpecies.length > 0 ? "Mass" : "",
      nameTextStyle: {
        color: "#f2f2f2",
        fontWeight: "bold",
      },
      position: "left",
      axisLabel: {
        margin: 20,
        color: "#ffffff63",
      },
      axisTick: {
        show: true,
        length: 15,
        lineStyle: {
          color: "#ffffff1f",
        },
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: "#ffffff1f",
        },
      },
      axisLine: {
        show: false,
      },
      max: function (value: any) {
        return Math.ceil(value.max * 1.03);
      },
    },
    dataset: {
      source: selectedSpecies,
    },
    grid: {
      top: 160,
      left: "10%",
      right: "10%",
      bottom: "10%",
      containLabel: true,
    },
    tooltip: {
      position: "top",
      backgroundColor: "#555",
      formatter: (datapoint: any) => {
        // console.log(datapoint)
        return (
          datapoint.marker +
          datapoint.data["name"] +
          "<br/>" +
          datapoint.data["gender"]
        );
      },
    },

    series: [
      {
        emphasis: {
          itemStyle: {
            borderColor: "#fff",
            borderWidth: 2,
          },
        },
        itemStyle: {
          color: "#f2e879",
        },
        symbolSize: 15,
        type: "scatter",
        encode: {
          x: "height",
          y: "mass",
        },
      },
    ],
  };

  return (
    <div className="App">
      <div style={{ position: "absolute", left: "50%", top: 70, zIndex: 4 }}>
        <div style={{ position: "relative", left: "-50%" }}>
          <span style={{ fontWeight: "bold", color: "#cfcfcf" }}>
            Pick a Species:{" "}
          </span>
          <Dropdown
            placeholder="Species"
            search
            selection
            options={speciesOptions}
            onChange={(_, data: any) => onOptionSelected(data.value)}
            loading={loadingFetchAllSpecies}
          />
        </div>
      </div>

      <ReactEcharts
        style={{ height: "100%", width: "100%" }}
        option={option}
        lazyUpdate={true}
        size-sensor
      />
    </div>
  );
}

export default App;
