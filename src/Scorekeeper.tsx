import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef, useState } from "react";
import { Alert, Animated, Dimensions } from "react-native";

import Home from "./Home";
import ScoresViewer from "./Viewer";

function structuredClone<T>(obj: T) {
  return JSON.parse(JSON.stringify(obj)) as T;
}

const SlidingView = (props: {
  children: React.ReactNode;
  show: boolean;
}) => {
  const [hidden, setHidden] = useState(true);
  const [currentTo, setCurrentTo] = useState(0);
  const [shouldHideOnDone, setShouldHideOnDone] = useState(false);
  const anim = useRef(new Animated.Value(0));

  const [doStartAnim, setDoStartAnim] = useState(false);

  useEffect(() => {
    if (!doStartAnim) return;

    Animated.timing(anim.current, {
      toValue: currentTo,
      duration: 250,
      useNativeDriver: true,
    }).start(() => shouldHideOnDone && setHidden(true));

    setDoStartAnim(false);
  }, [doStartAnim]);

  useEffect(() => {
    if (props.show == undefined) return;
    const rev = !props.show;
    console.log("reverse:", rev);

    const to = rev ? Dimensions.get("screen").width : 0;
    anim.current = new Animated.Value(
      rev ? 0 : Dimensions.get("screen").width
    );
    setCurrentTo(to);
    setShouldHideOnDone(rev);
    setHidden(false);

    setDoStartAnim(true);
  }, [props.show]);

  return !hidden ? (
    <Animated.View
      style={{
        transform: [{ translateX: anim.current }],
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "white",
        zIndex: 1,
      }}
    >
      {props.children}
    </Animated.View>
  ) : (
    <></>
  );
};

export default () => {
  const [lastOpenGame, setLastOpenGame] = useState("");
  const [openGame, setOpenGame] = useState("");
  const [games, setGames] = useState<GameData[]>([]);

  useEffect(() => {
    AsyncStorage.getItem("savedata").then((data) => {
      if (data == null) return;
      let gamelist = JSON.parse(data) as GameData[];
      gamelist = gamelist.sort((a, b) => b.createdAt - a.createdAt);
      setGames(gamelist);
    });
  }, []);

  useEffect(() => {
    if (!openGame) return;
    setLastOpenGame(openGame);
  }, [openGame]);

  useEffect(() => {
    if (!games) return;
    if (games.length == 0) return;

    AsyncStorage.setItem("savedata", JSON.stringify(games));
  }, [games]);

  const clearSaveData = () => {
    setGames([]);
    AsyncStorage.removeItem("savedata", (err) => {
      if (err == null) Alert.alert("Save data cleared.");
      else Alert.alert("An error occured", err.toString());
    });
  };

  const createGame = (n: string) => {
    setGames([
      ...structuredClone(games),
      { name: n, scores: [], createdAt: Date.now() },
    ]);

    setOpenGame(n);
  }

  return (
    <>
      <Home
        games={games}
        openGame={(g) => setOpenGame(g)}
        createGame={createGame}
        clearSaveData={clearSaveData}
      />
      <SlidingView show={openGame.length > 0}>
        {games.find((x) => x.name == openGame) ? (
          <ScoresViewer
            game={games.find((x) => x.name == openGame)}
            back={() => setOpenGame("")}
            save={(newg) =>
              setGames(games.map((x) => (x.name == openGame ? newg : x)))
            }
            rename={(name) => {
              setGames(
                games.map((x) => (x.name == openGame ? { ...x, name } : x))
              );

              setOpenGame(name);
            }}
            delete={() => {
              setGames(games.filter((x) => x.name != openGame));
              setOpenGame("");
            }}
          />
        ) : (
          <ScoresViewer
            game={games.find((x) => x.name == lastOpenGame)}
            back={() => {}}
            save={() => {}}
            rename={() => {}}
            delete={() => {}}
          />
        )}
      </SlidingView>
    </>
  );
};
