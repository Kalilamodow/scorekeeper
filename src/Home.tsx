import { useState } from "react";
import { Alert, View } from "react-native";
import {
  Appbar,
  Button,
  Card,
  Dialog,
  Portal,
  TextInput,
} from "react-native-paper";

type GameCardProps = {
  game: GameData;
  open: () => void;
};

const GameCard = (props: GameCardProps) => (
  <Card style={{ width: "90%", marginHorizontal: "auto", marginTop: 10 }}>
    <Card.Title
      title={props.game.name}
      titleStyle={{ fontWeight: "bold" }}
      subtitle={
        props.game.scores.length > 0
          ? props.game.scores.map((x) => x.name).join(", ")
          : "No people"
      }
      right={() => (
        <Button
          onPress={props.open}
          mode='outlined'
          style={{ marginRight: 16 }}
        >
          Open
        </Button>
      )}
    />
  </Card>
);

type HomeProps = {
  openGame: (name: string) => void;
  createGame: (name: string) => void;
  clearSaveData: () => void;
  games: GameData[];
};

export default function Home(props: HomeProps) {
  const [createGameDialogOpen, setCreateGameDialogOpen] = useState(false);
  const [createGameDialogInput, setCreateGameDialogInput] = useState("");

  const [optionsDialogOpen, setOptionsDialogOpen] = useState(false);

  const createGame = () => {
    if (
      createGameDialogInput.length < 3 ||
      createGameDialogInput.length > 10
    )
      return;

    if (
      props.games.map((x) => x.name).includes(createGameDialogInput.trim())
    )
      return;

    props.createGame(createGameDialogInput.trim());
    setCreateGameDialogOpen(false);
  };

  return (
    <>
      <Portal>
        <Dialog
          visible={createGameDialogOpen}
          onDismiss={() => setCreateGameDialogOpen(false)}
        >
          <Dialog.Title>New Game</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label='Game Name'
              defaultValue=''
              onChangeText={(t) => setCreateGameDialogInput(t)}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              mode='text'
              onPress={() => setCreateGameDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button mode='text' onPress={() => createGame()}>
              Create
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog
          visible={optionsDialogOpen}
          onDismiss={() => setOptionsDialogOpen(false)}
        >
          <Dialog.Title>Options</Dialog.Title>
          <Dialog.Content>
            <Button
              onPress={() =>
                Alert.alert(
                  "Confirmation",
                  "Are you sure you would like to clear your locally saved data? This " +
                    "will erase your game list.",
                  [
                    {
                      text: "Nevermind",
                      style: "cancel",
                    },
                    {
                      text: "Confirm",
                      style: "destructive",
                      onPress: () => props.clearSaveData(),
                    },
                  ]
                )
              }
              mode='outlined'
            >
              Clear Save Data
            </Button>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setOptionsDialogOpen(false)}>
              Close
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Appbar.Header elevated>
        <Appbar.Content title='Scorekeeper' />
        <Appbar.Action
          icon='cog'
          onPress={() => setOptionsDialogOpen(true)}
        />
      </Appbar.Header>

      <View style={{ height: 5 }} />

      {props.games.map((game) => (
        <GameCard
          game={game}
          key={game.name}
          open={() => props.openGame(game.name)}
        />
      ))}

      <Button
        mode='contained-tonal'
        style={{ marginHorizontal: 20, marginTop: 15 }}
        onPress={() => setCreateGameDialogOpen(true)}
      >
        Create
      </Button>
    </>
  );
}
