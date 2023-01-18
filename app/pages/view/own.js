import React, { useState, useEffect, useContext } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { collection, query, where, orderBy, getDocs, doc, getDoc } from 'firebase/firestore';
import ReactGA from 'react-ga';
import ReactTooltip from 'react-tooltip';

import { FirebaseContext } from '/lib/firebase.js';

import { Footer } from '/components/Footer.js';
import { Header } from '/components/Header.js';
import { Map } from '/components/Map.js';
import { Metatags } from '/components/Metatags.js';
import { Theme } from '/components/Theme.js';

export default function ViewOwn(props) {
  const router = useRouter();
  const firebaseContext = useContext(FirebaseContext);

  const [ userSystems, setUserSystems ] = useState([]);

  useEffect(() => {
    if (!firebaseContext.authStateLoading && firebaseContext.user && firebaseContext.user.uid) {
      const systemsCollection = collection(firebaseContext.database, 'systems');
      // TODO: add db index for sorting
      // const userViewsQuery = query(systemsCollection, where('userId', '==', firebaseContext.user.uid), orderBy('keywords', 'asc'));
      const userViewsQuery = query(systemsCollection, where('userId', '==', firebaseContext.user.uid));
      getDocs(userViewsQuery)
        .then((systemsSnapshot) => {
          let sysChoices = [];
          systemsSnapshot.forEach(sDoc => sysChoices.push(sDoc.data()));
          setUserSystems(sysChoices);
          ReactTooltip.rebuild();
        })
        .catch((error) => {
          console.log("Error getting documents: ", error);
        });
    } else if (!firebaseContext.authStateLoading) {
      // user not signed in
      props.onToggleShowAuth(true);
    }
  }, [firebaseContext.user, firebaseContext.authStateLoading]);

  const handleHomeClick = () => {
    ReactGA.event({
      category: 'View',
      action: 'Home'
    });

    const goHome = () => {
      router.push({
        pathname: '/explore'
      });
    }

    goHome();
  }

  const renderChoices = () => {
    let choices = [];
    for (const system of userSystems) {
      choices.push(
        <Link className="Own-systemChoice" key={system.systemNumStr} href={`/edit/${system.systemId}`}>
          {system.title ? system.title : 'Unnamed System'}
        </Link>
      );
    }
    return(
      <div className="Own-systemChoicesWrap FadeAnim">
        <h1 className="Own-systemChoicesHeading">
          Your maps
        </h1>
        <div className="Own-systemChoices">
          {choices}
          <Link className="Own-newSystem Link" href={`/edit/new`}>
            Start a new map
          </Link>
        </div>
      </div>
    );
  }

  return <Theme>
    <Metatags />
    <Header onHomeClick={handleHomeClick} onToggleShowSettings={props.onToggleShowSettings} onToggleShowAuth={props.onToggleShowAuth} />

    <main className="ViewOwn">
      {!firebaseContext.authStateLoading && renderChoices()}

      <Map system={{ lines: {}, stations: {} }} interlineSegments={{}} changing={{}} focus={{}}
           systemLoaded={false} viewOnly={false} waypointsHidden={false} />
    </main>

    <Footer onToggleShowMission={props.onToggleShowMission} />
  </Theme>;
}
