import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Audio } from "expo-av";
import { AntDesign } from "@expo/vector-icons";
import styles from "./styles";
import { Dimensions } from "react-native";
const windowWidth = Dimensions.get("window").width;

const App = () => {
  const [newWord, setNewWord] = useState("");
  const [checkedWord, setCheckedWord] = useState("");
  const [definition, setDefinition] = useState("");
  const [example, setExample] = useState("");
  const [sound, setSound] = useState();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const searchWord = (enteredWord) => {
    setNewWord(enteredWord);
  };

  const getInfo = async () => {
    let url = "https://api.dictionaryapi.dev/api/v2/entries/en/" + newWord;
    try {
      const response = await fetch(url);
      const fetchedData = await response.json();
      if (response.status === 200) {
        // successful response
        setData(fetchedData);
        let word = fetchedData[0].word;
        setCheckedWord(word);
        let def = fetchedData[0].meanings[0].definitions[0].definition;
        setDefinition(def);
        let eg = fetchedData[0].meanings[0].definitions[0].example;
        setExample(eg);
        setError(null);
      } else {
        // API response indicates an error
        setError("Word not found in the database");
        // Automatically clear the error after 3 seconds
        setTimeout(() => {
          setError(null);
        }, 3000);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("An error occurred while fetching data");
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };

  const playAudio = async () => {
    if (
      data &&
      data[0].phonetics &&
      data[0].phonetics[0] &&
      data[0].phonetics[0].audio
    ) {
      if (sound) {
        await sound.unloadAsync();
      }
      const audioUri = data[0].phonetics[0].audio;
      const { sound, status } = await Audio.Sound.createAsync({
        uri: audioUri,
      });
      if (status.isLoaded) {
        setSound(sound);
        await sound.playAsync();
      }
    }
  };

  const clear = async () => {
    setCheckedWord("");
    setDefinition("");
    setExample("");
    setNewWord("");

    if (sound) {
      await sound.unloadAsync();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Dictionary App</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Search the word ..."
          onChangeText={(text) => searchWord(text)}
        />
        <TouchableOpacity style={styles.button} onPress={() => getInfo()}>
          <Text style={styles.buttonText}>Search</Text>
        </TouchableOpacity>
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
      {checkedWord && !error && (
        <ScrollView
          horizontal={true}
          style={styles.ScrollView}
          contentContainerStyle={styles.resultsContainer}
        >
          <View>
            <Text style={styles.word}>{checkedWord}</Text>
            <TouchableOpacity
              style={styles.playButton}
              onPress={() => playAudio()}
            >
              <AntDesign name="sound" size={23} color="#ffffff" />
            </TouchableOpacity>
            <View style={styles1.resultTextContainer}>
              <Text style={styles.resultText}>Definition: {definition}</Text>
              <Text style={styles.resultText}>Example: {example}</Text>
            </View>
          </View>
        </ScrollView>
      )}
      <TouchableOpacity style={styles.clearButton} onPress={() => clear()}>
        <Text style={styles.buttonText}>Clear</Text>
      </TouchableOpacity>
    </View>
  );
};

export default App;

const styles1 = StyleSheet.create({
  resultTextContainer: {
    alignItems: "flex-start",
    width: windowWidth,
    height: "auto",
    paddingTop: 20,
  },
});
