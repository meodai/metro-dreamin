import React, { useState, useContext } from 'react';
import ReactGA from 'react-ga';

import { FirebaseContext, getSystemFromBranch } from '/lib/firebase.js';
import { renderFadeWrap } from '/lib/util.js';

import Edit from '/pages/edit/[systemId].js';
import { Footer } from '/components/Footer.js';
import { Header } from '/components/Header.js';
import { Map } from '/components/Map.js';
import { Metatags } from '/components/Metatags.js';
import { Start } from '/components/Start.js';
import { Theme } from '/components/Theme.js';

export async function getServerSideProps({ params, query }) {
  let systemFromBranch;

  if (query.fromDefault) {
    systemFromBranch = await getSystemFromBranch(query.fromDefault, true);
  } else if (query.fromSystem) {
    systemFromBranch = await getSystemFromBranch(query.fromSystem, false);
  }

  if (systemFromBranch && systemFromBranch.map && systemFromBranch.meta && systemFromBranch.ancestors) {
    return { props: { systemFromBranch } };
  }

  return { props: {} };
}

export default function EditNew(props) {
  const firebaseContext = useContext(FirebaseContext);

  const [systemDoc, setSystemDoc] = useState(props.systemFromBranch);
  const [mapBounds, setMapBounds] = useState();
  const [map, setMap] = useState();

  const handleMapInit = (map) => {
    setMap(map);
  }

  const handleSelectSystem = (system, meta, mapBounds = [], ancestors = []) => {
    setSystemDoc({
      map: system,
      meta,
      ancestors
    });
    setMapBounds(mapBounds);
  }

  const renderEdit = () => {
    // render full Edit component
    return <Edit systemDocData={systemDoc} fullSystem={systemDoc} ownerDocData={firebaseContext.settings} isNew={true} newMapBounds={mapBounds}
                 onToggleShowSettings={props.onToggleShowSettings}
                 onToggleShowAuth={props.onToggleShowAuth}
                 onToggleShowMission={props.onToggleShowMission} />
  }

  const renderNew = () => {
    return (
      <>
        <Metatags />

        {renderFadeWrap(!firebaseContext.authStateLoading && <Start map={map} database={firebaseContext.database}
                                                                    settings={firebaseContext.settings}
                                                                    onSelectSystem={handleSelectSystem} />,
                        'start')}

        <Map system={{ lines: {}, stations: {} }} interlineSegments={{}} changing={{}} focus={{}}
             systemLoaded={false} viewOnly={false} waypointsHidden={false}
             onMapInit={handleMapInit} />
      </>
    );
  }

  if (systemDoc && systemDoc.meta) {
    return renderEdit();
  }

  return <Theme>
    <Header onToggleShowSettings={props.onToggleShowSettings} onToggleShowAuth={props.onToggleShowAuth} />

    <main className="EditNew">
      {renderNew()}
    </main>

    <Footer onToggleShowMission={props.onToggleShowMission} />
  </Theme>;
}
