import { useEffect, useState } from 'react';
import { RouteProps, DirectionAndStopProps } from '../types/transitApiDataTypes';
import { CSSTransition } from 'react-transition-group';
import { MetroSelect } from '../components/MetroSelect';

import '../App.css'
import { fetchRouteDirections, fetchRoutes, fetchRouteStops, fetchRouteTimeDepartures } from '../services';
import { useContext } from 'react';
import { DeparturesContext } from '../context/DeparturesProvider';
import { useHistory } from 'react-router-dom';

export const NextTrip = () => {
  const departureContext = useContext(DeparturesContext)
  const history = useHistory()

  const [allRoutes, setAllRoutes] = useState<RouteProps[]>([])
  const [routeDirections, setRouteDirections] = useState<DirectionAndStopProps[]>([])
  const [routeStops, setRouteStops] = useState<DirectionAndStopProps[]>([])
  const [selectedRoute, setSelectedRoute] = useState<string>('')
  const [selectedDirection, setSelectedDirection] = useState<string>('')
  const [selectedStop, setSelectedStop] = useState<string>('')
 
  useEffect(() => {
    let mounted = true
    if (mounted) {
      initialRouteGet()
    }
   return ()=> {mounted = false}
  }, [])

  const initialRouteGet = async () => {
    let allRoutesResponse = await fetchRoutes()
    if (allRoutesResponse?.data) setAllRoutes(allRoutesResponse.data ?? [])
  }

  const cascadeFilterReset = (num: number) => {
    switch (num) {
      case 1:
          setRouteDirections([])
          setRouteStops([])
          setSelectedDirection('')
          setSelectedStop('')

        return
      case 2:
          setRouteStops([])
          setSelectedStop('')

        return
    }
  }

  return (
    <div className="main-content">
      <div style={{ width: '40%', minWidth: '400px', display: 'flex', flexDirection: 'column' }}>
        <h1 style={{ textAlign: 'center' }}>Real Time Departures</h1>
        <MetroSelect
          className="slide-down-enter-done"
          value={selectedRoute}
          onChange={(event) => {
            cascadeFilterReset(1)
            setSelectedRoute(event.target.value)
            fetchRouteDirections(event.target.value)
              .then(response => setRouteDirections(response.data))
          }}
          defaultText="Select route"
          data={allRoutes}
        />
        {
          <CSSTransition
            in={!!selectedRoute}
            timeout={{ enter: 300, exit: 0 }}
            classNames="slide-down"
            unmountOnExit
            mountOnEnter
          ><MetroSelect
              value={selectedDirection}
              onChange={(event) => {
                cascadeFilterReset(2)
                setSelectedDirection(event.target!.value)
                fetchRouteStops(selectedRoute, event.target.value)
                  .then(response => setRouteStops(response.data))
              }}
              defaultText="Select direction"
              data={routeDirections}
            />
          </CSSTransition>
        }
        {
          <CSSTransition
            in={!!selectedDirection}
            timeout={{ enter: 300, exit: 0 }}
            classNames="slide-down"
            unmountOnExit
            mountOnEnter
          >
            <MetroSelect
              value={selectedStop}
              onChange={(event) => {
                setSelectedStop(event.target.value)
                fetchRouteTimeDepartures(selectedRoute, selectedDirection, event.target.value)
                  .then(response => {
                      departureContext.setRouteDepartures(response.departuresData.data)
                      departureContext.setStopDetailInfo(response.stopDetailData.data)
                  })
              }}
              defaultText="Select stop"
              data={routeStops}
            />
          </CSSTransition>
        }
        <CSSTransition
          in={!!selectedStop}
          timeout={{ enter: 300, exit: 0 }}
          classNames="slide-down"
          unmountOnExit
          mountOnEnter
        >
          <button className="metro-button" onClick={() => history.push('/BusTable')}>View upcoming busses</button>
        </CSSTransition>
      </div>
    </div>
  )
}
