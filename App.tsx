import { AppRegistry } from "react-native";
import { PaperProvider, MD3LightTheme } from "react-native-paper";
import Scorekeeper from "./src/Scorekeeper";
import { StatusBar } from "expo-status-bar";;

export default function App() {
  return (
    <>
      <StatusBar style="dark" />
      <PaperProvider theme={MD3LightTheme}>
        <Scorekeeper />
      </PaperProvider>
    </>
  );
}

AppRegistry.registerComponent("scorekeeper", () => App);


