import { AppRegistry } from "react-native";
import { PaperProvider, MD3LightTheme } from "react-native-paper";
import AppContainer from "./src/AppContainer";
import { StatusBar } from "expo-status-bar";;

export default function App() {
  return (
    <>
      <StatusBar style="dark" />
      <PaperProvider theme={MD3LightTheme}>
        <AppContainer />
      </PaperProvider>
    </>
  );
}

AppRegistry.registerComponent("scorekeeper", () => App);


