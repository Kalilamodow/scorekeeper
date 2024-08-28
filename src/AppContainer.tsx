import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef, useState } from "react";
import { Alert, Animated, Dimensions } from "react-native";
import { Text } from "react-native-paper";

import Home from "./Home";
import ScoresViewer from "./ScoresViewer";

function structuredClone<T>(obj: T) {
  return JSON.parse(JSON.stringify(obj)) as T;
}

const SlideIntoView = (props: { children: React.ReactNode }) => {
  const anim = useRef(
    new Animated.Value(Dimensions.get("screen").width)
  ).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [anim]);

  return (
    <Animated.View
      style={{
        transform: [{ translateX: anim }],
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
  );
};

export default () => {
  const [openGame, setOpenGame] = useState("");
  const [games, setGames] = useState<GameData[]>([]);

  const scoreViewAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    AsyncStorage.getItem("savedata").then((data) => {
      if (data == null) return;
      setGames(JSON.parse(data));
    });
  }, []);

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

  return (
    <>
      <Home
        games={games}
        openGame={(g) => setOpenGame(g)}
        createGame={(n) =>
          setGames([...structuredClone(games), { name: n, scores: [] }])
        }
        clearSaveData={clearSaveData}
      />
      {games.find((x) => x.name == openGame) && (
        <SlideIntoView>
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
          />
        </SlideIntoView>
      )}
    </>
  );
};
