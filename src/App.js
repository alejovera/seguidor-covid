import React, {useState, useEffect} from 'react';
import './App.css';
import Infobox from './Infobox';
import Map from './Map';
import Table from './Table';
import LineGraph from './LineGraph';
import { 
  MenuItem,
  FormControl,
  Select,
  Typography, Card, CardContent
} from '@material-ui/core';
import { sortData } from './util';
import { prettyPrintStat } from './util';
import "leaflet/dist/leaflet.css";


function App() {

  const [ countries, setCountries ] = useState(['USA', 'ARG'])
  const [country, setCountry] = useState('worldwide')
  const [ countryInfo, setCountryInfo ] = useState({})
  const [ tableData, setTableData ] = useState([])
  const [ mapCenter, setMapCenter ] = useState({ lat: 40.93619, lng: -3.379333 })
  const [mapZoom, setMapZoom ] = useState(2)
  const [mapCountries, setMapCountries] = useState([])
  const [casesType, setCasesType] = useState("cases")

  useEffect(() => {
    fetch('https://disease.sh/v3/covid-19/all')
      .then(response => response.json())
      .then(data => {
        setCountryInfo(data)
      })
  }, [])

  useEffect(() => {
    // hacer el request a un server async

    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
        .then((response) => response.json())
        .then((data) => {
          const countries = data.map((country) => (
            {
              name: country.country,
              value: country.countryInfo.iso2
            }
          ))

          const sortedData = sortData(data)
          setTableData(sortedData)
          setMapCountries(data)
          setCountries(countries)
        })
    }
    getCountriesData();
  }, [countries])

  const onCountryChange = async (e) => {
    const countryCode = e.target.value;
    setCountry(countryCode)
    console.log(countryCode);
    const url = countryCode === 'worldwide' 
    ? 'https://disease.sh/v3/covid-19/all'
    : `https://disease.sh/v3/covid-19/countries/${countryCode}`

    await fetch(url)
      .then(response => response.json())
      .then(data => {
        setCountry(countryCode)
        setCountryInfo(data)
        setMapCenter([data.countryInfo.lat, data.countryInfo.long])
        setMapZoom(4)
      })
  }

  return (
    <div className="app">
      {/* Header */}
      {/* Title + Select input dropdownd  */}

      <div className="app__left">
        <div className="app__header">
          <h1>Seguidor de casos COVID-19</h1>
          <FormControl className="app__dropdown">
            <Select
              onChange={onCountryChange}
              variant="outlined" 
              value={country}
            >
              <MenuItem value="worldwide">En todo el Mundo</MenuItem>
            { countries.map(country => (
              <MenuItem value={country.value}>{country.name}</MenuItem>
            ))}

            </Select>
          </FormControl>
        </div>

        <div className="app__stats">
          <Infobox 
            isRed
            active={casesType === "cases"}
            onClick={e => setCasesType('cases')}
            title="Casos de Coronavirus" 
            cases={prettyPrintStat(countryInfo.todayCases)} 
            total={countryInfo.cases}
          /> 
          <Infobox active={casesType==="recovered"} onClick={e => setCasesType('recovered')} title="Recuperados" cases={prettyPrintStat(countryInfo.todayRecovered)} total={countryInfo.recovered} /> 

          <Infobox isRed active={casesType==="deaths"} onClick={e => setCasesType('deaths')} title="Muertes" cases={prettyPrintStat(countryInfo.todayDeaths)} total={countryInfo.deaths} /> 

        </div>
        <Map 
          casesType={casesType}
          countries={mapCountries}
          center={mapCenter}
          zoom={mapZoom}
        />
        
        
        
      </div>
      <Card className="app_right">
        <CardContent>
          <h3>Casos actuales por pais</h3>
          <Table countries={tableData} />
          <h3 className="app__graphTitle">Nuevos {casesType} mundiales </h3>
          <LineGraph className="app__graph" casesType={casesType} />
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
