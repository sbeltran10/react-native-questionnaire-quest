import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Text, Button, ListItem, Overlay } from 'react-native-elements';
import styles from '../styles/Question';
import { ScrollView } from 'react-native-gesture-handler';
import AnswerCorrectIncorrect from './AnswerCorrectIncorrect';
import Outcome from './Outcome';
import PropTypes from 'prop-types';
import { WebView } from 'react-native-webview';

/**
 * This functinal component renders a question along with its associated answers and the elments required to submit
 * the answer and display the result of selecting a specific answer
 */
let Question = ({ question = [{ content: "No question content" }], answers, selectAnswer, selectedAnswer, checkAnswer, saveAnswerSelection, modalVisible, correctAnswer, isLoading, type, mediaIsLoading, mediaLoading }) => (
  <View style={styles.mainView}>
    <View style={styles.questionView}>
      <Text h4>{question[0].content}</Text>
    </View>
    {
      question[0].mediaLink &&
      <View style={styles.mediaContainer}>
        <WebView style={styles.webView}
          onLoadStart={() => mediaLoading(true)}
          onLoad={() => mediaLoading(false)}
          source={{ uri: question[0].mediaLink }} />

        {mediaIsLoading &&
          <View style={styles.mediaActivityIndicator}>
            <ActivityIndicator animating={true} size="small" color="#0000ff" />
          </View>
        }
      </View>
    }
    <View style={styles.answersView}>
      {/* A Scrollview is used in case the amount or length of the answers is greater than the screen's height */}
      <ScrollView contentContainerStyle={styles.scrollView}>
        {
          answers.map((answer, i) => (
            < React.Fragment key = { i } >
            {
              question[0].isMultiple ?
                <ListItem
                  leftIcon={selectedAnswer && selectedAnswer.find(a => a.id === answer.id) ?
                    { name: 'check-box' }
                    :
                    { name: 'check-box-outline-blank' }}
                  title={answer.content}
                  onPress={() => selectAnswer(answer)}
                  containerStyle={selectedAnswer && selectedAnswer.find(a => a.id === answer.id) ?
                    styles.answerContainerSelected
                    :
                    styles.answerContainer
                  }
                />
                :
                <ListItem
                  leftIcon={selectedAnswer[0] && selectedAnswer[0].id === answer.id ?
                    { name: 'radio-button-checked' }
                    :
                    { name: 'radio-button-unchecked' }}
                  title={answer.content}
                  onPress={() => selectAnswer(answer)}
                  containerStyle={selectedAnswer[0] && selectedAnswer[0].id === answer.id ?
                    styles.answerContainerSelected
                    :
                    styles.answerContainer
                  }
                />
            }

            </React.Fragment>
      ))
    }
      </ScrollView>
    </View>

    {isLoading &&
      <View style={styles.activityIndicator}>
        <ActivityIndicator
          animating={true}
          size="large"
          color="#0000ff"
        />
      </View>
    }

    {!isLoading &&
      <Button
        buttonStyle={styles.submitButton}
        onPress={checkAnswer}
        title="Submit answer"
      />
    }
    {/* The overlay can show additional information about the question and/or answers if necessary */}
    {
      type === 'quiz' &&
      <Overlay
        isVisible={modalVisible}
        windowBackgroundColor="rgba(0, 0, 0, .7)"
        width='90%'
        height='80%'
      >
        <AnswerCorrectIncorrect
          saveAnswerSelection={saveAnswerSelection}
          question={question}
          selectedAnswer={selectedAnswer}
          correctAnswer={correctAnswer}
          isLoading={isLoading}
        />
      </Overlay>
    }

    {
      type === 'game' &&
      <Overlay
        isVisible={modalVisible}
        windowBackgroundColor="rgba(0, 0, 0, .7)"
        width='90%'
        height='80%'
      >
        <Outcome
          saveAnswerSelection={saveAnswerSelection}
          selectedAnswer={selectedAnswer}
          isLoading={isLoading}
        />
      </Overlay>
    }
  </View>
)

Question.propTypes = {
  // Currently active question
  question: PropTypes.array,
  // Answers associated to the currently active question
  answers: PropTypes.array,
  // Function called when an answer is picked from the list
  selectAnswer: PropTypes.func,
  // Function called when an answer is submitted using the button
  checkAnswer: PropTypes.func,
  // Function used to submit the answer selection, updating the currently active question and answers
  saveAnswerSelection: PropTypes.func,
  // Controls whenever the modal containing the correct/incorrect selection is visible
  modalVisible: PropTypes.bool,
  // Currently selected answer
  selectedAnswer: PropTypes.array,
  // Correct answer in case the type of questionnaire is a quiz
  correctAnswer: PropTypes.object
};

export default Question;

