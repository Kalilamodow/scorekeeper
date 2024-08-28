import { useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import {
  Appbar,
  Button,
  Dialog,
  Divider,
  Menu,
  Portal,
  Text,
  TextInput,
} from "react-native-paper";

type ScoresViewerProps = {
  game: GameData;
  back: () => void;
  save: (game: GameData) => void;
  rename: (newName: string) => void;
  delete: () => void;
};

const listStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 5,
  },
  inner: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 0,
  },
  text: {
    fontSize: 18,
    paddingHorizontal: 7,
    paddingTop: 7,
  },
});

type InputDialogProps = {
  visible: boolean;
  title: string;
  textLabel: string;
  close: () => void;
  confirm: (value: string) => void;
  verify: (value: string) => boolean;
};

const InputDialog = (props: InputDialogProps) => {
  const [input, setInput] = useState("");

  return (
    <Dialog visible={props.visible} onDismiss={props.close}>
      <Dialog.Title>{props.title}</Dialog.Title>
      <Dialog.Content>
        <TextInput
          label={props.textLabel}
          onChangeText={(v) => setInput(v)}
          defaultValue=''
          error={!props.verify(input)}
        />
      </Dialog.Content>
      <Dialog.Actions>
        <Button onPress={props.close}>Cancel</Button>
        <Button onPress={() => props.confirm(input)}>Confirm</Button>
      </Dialog.Actions>
    </Dialog>
  );
};

export default (props: ScoresViewerProps) => {
  const [game, setGame] = useState(
    JSON.stringify(props.game || { name: "", scores: [] })
  );

  const [amountEnterDialogType, setAmountEnterDialogType] = useState<
    "+" | "-" | ""
  >("");
  const [amountEnterDialogName, setAmountEnterDialogName] =
    useState<string>("");

  const [newPersonDialogOpen, setNewPersonDialogOpen] = useState(false);
  const [renameGameDialogOpen, setRenameGameDialogOpen] = useState(false);

  const [namePressCtxMenuOpen, setNamePressCtxMenuOpen] = useState(false);
  const [namePressCtxMenuName, setNamePressCtxMenuName] = useState("");
  const [namePressCtxMenuPos, setNamePressCtxMenuPos] = useState({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    if (game.length > 2) props.save(JSON.parse(game));
  }, [game]);

  const changeScore = (name: string, amount: number) => {
    const current: GameData = JSON.parse(game);
    current.scores = current.scores.map((x) =>
      x.name == name ? { ...x, score: x.score + amount } : x
    );

    setGame(JSON.stringify(current));
  };

  const openAmountEnterDialog = (name: string, dir: "+" | "-") => {
    setAmountEnterDialogName(name);
    setAmountEnterDialogType(dir);
  };

  const amountEnterDialogSubmitted = (amountStr: string) => {
    const amount = parseInt(amountEnterDialogType + amountStr, 10);

    if (Number.isNaN(amount)) return;

    changeScore(amountEnterDialogName, amount);
    setAmountEnterDialogType("");
  };

  const addNewPerson = (name: string) => {
    if (name.length < 2 || name.length > 10) return;

    const current: GameData = JSON.parse(game);
    if (current.scores.find((x) => x.name == name.trim())) return;
    current.scores.push({ name: name.trim(), score: 0 });
    setGame(JSON.stringify(current));

    setNewPersonDialogOpen(false);
  };

  const deletePerson = (name: string) => {
    const current: GameData = JSON.parse(game);
    current.scores = current.scores.filter((x) => x.name != name);
    setGame(JSON.stringify(current));

    setNamePressCtxMenuOpen(false);
  };

  return (
    <>
      <Portal>
        <InputDialog
          visible={amountEnterDialogType.length > 0}
          close={() => setAmountEnterDialogType("")}
          title={`${
            amountEnterDialogType == "+" ? "Increase" : "Decrease"
          } score by`}
          textLabel='Amount'
          verify={(v) =>
            !Number.isNaN(parseInt(amountEnterDialogType + v, 10))
          }
          confirm={amountEnterDialogSubmitted}
        />

        <InputDialog
          visible={newPersonDialogOpen}
          close={() => setNewPersonDialogOpen(false)}
          title='Add Person'
          textLabel='Name'
          verify={(v) => v.length >= 2 && v.length <= 10}
          confirm={addNewPerson}
        />

        <InputDialog
          visible={renameGameDialogOpen}
          close={() => setRenameGameDialogOpen(false)}
          title='Rename Game'
          textLabel='New Name'
          verify={(v) => v.length >= 3 && v.length <= 10}
          confirm={(v) => (
            props.rename(v), setRenameGameDialogOpen(false)
          )}
        />
      </Portal>

      <Menu
        visible={namePressCtxMenuOpen}
        onDismiss={() => setNamePressCtxMenuOpen(false)}
        anchor={namePressCtxMenuPos}
      >
        <Menu.Item
          title='Delete'
          onPress={() =>
            Alert.alert(
              "Confirmation",
              "Are you sure you would like to delete " +
                namePressCtxMenuName +
                "'s score?",
              [
                {
                  text: "Cancel",
                  style: "cancel",
                },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: () => deletePerson(namePressCtxMenuName),
                },
              ]
            )
          }
        />
      </Menu>

      <Appbar.Header elevated>
        <Appbar.BackAction onPress={props.back} />
        <Appbar.Content title={JSON.parse(game).name} />
        <Appbar.Action
          icon='rename-box'
          onPress={() => setRenameGameDialogOpen(true)}
        />
        <Appbar.Action
          icon='trash-can'
          onPress={() =>
            Alert.alert(
              "Confirmation",
              "Are you sure you want to remove this game?",
              [
                {
                  text: "Cancel",
                  style: "cancel",
                },
                {
                  text: "Remove",
                  style: "destructive",
                  onPress: () => props.delete(),
                },
              ]
            )
          }
        />
      </Appbar.Header>

      <View style={{ height: 10 }} />

      {(JSON.parse(game) as GameData).scores.map((person, index, arr) => (
        <View key={person.name}>
          <View style={listStyles.container}>
            <View style={listStyles.inner}>
              <Text
                style={listStyles.text}
                onPress={(g) => {
                  setNamePressCtxMenuPos({
                    x: g.nativeEvent.pageX,
                    y: g.nativeEvent.pageY,
                  });
                  setNamePressCtxMenuName(person.name);

                  setNamePressCtxMenuOpen(true);
                }}
              >
                {person.name}
              </Text>
              <Text style={[listStyles.text, { fontWeight: "bold" }]}>
                {person.score}
              </Text>
            </View>
            <View style={listStyles.inner}>
              <Button onPress={() => changeScore(person.name, 1)} compact>
                Add
              </Button>
              <Button onPress={() => changeScore(person.name, -1)} compact>
                Remove
              </Button>
              <Button
                onPress={() => openAmountEnterDialog(person.name, "+")}
                compact
              >
                Increase by
              </Button>
              <Button
                onPress={() => openAmountEnterDialog(person.name, "-")}
                compact
              >
                Decrease by
              </Button>
            </View>
          </View>

          {index != arr.length - 1 && <Divider />}
        </View>
      ))}

      <Button
        mode='contained-tonal'
        style={{ marginHorizontal: 20 }}
        onPress={() => setNewPersonDialogOpen(true)}
      >
        Add Person
      </Button>
    </>
  );
};
