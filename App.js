/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { View, Text } from "react-native";
import Index from './src/containers/Index';
import Intro from './src/containers/Intro';
import Question from './src/components/Question';
import SurveyResults from './src/components/SurveyResults';
import QuizResults from './src/components/QuizResults';
import styles from './src/styles/main';

import AnswerAPI from './src/api/AnswerAPI';
import QuestionnaireAPI from './src/api/QuestionnaireAPI';
import QuestionAPI from './src/api/QuestionAPI';

class App extends Component {
  constructor (props) {
    super(props);
    this.state = {
      type: '',
      questionnaires: [],
      currentStep: "index",
      selectedQuestionnaireId: null,
      selectedQuestionnaireTitle: '',
      questionnaire: [],
      question: [],
      answers: [],
      correctAnswer: null,
      selectedAnswer: [],
      modalVisible: false,
      summary: [],
      //quizTitle: null, - same as selectedQuestionnaireTitle
      //quizResults:[], - same as summary
      totalCountOfQuestions: 0,
      countCorrect: 0

    }
  }

  componentWillMount() {
    this.onPickerValueChange('survey');
  }


  // call back for setState in onPickerValueChange
  fetchList = () => {
    QuestionnaireAPI.getByType(this.state.type, (err, data) => {
      let stateCopy = { ...this.state };
      if (err) console.log(err);
      stateCopy.questionnaires = data.Items;
      this.setState(stateCopy);
    })
  }

  // updates type and populate questionnaire array with corresponding list of questionnaires
  onPickerValueChange = (type) => {
    let stateCopy = { ...this.state };
    stateCopy.type = type;
    // reset selected questionnaire to none everytime a new category is selected
    stateCopy.selectedQuestionnaireId = 0;
    this.setState(stateCopy, () => this.fetchList());
  }

  updateSelectedQuestionnaireId = (id, title) => {
    let stateCopy = { ...this.state };
    stateCopy.selectedQuestionnaireId = id;
    //title needed for the results page
    stateCopy.selectedQuestionnaireTitle = title;
    this.setState(stateCopy, () => { console.log(this.state) })
  }

  countCorrectAnswers () {
    let correctAnswers = 0;
    for (let i = 0; i < this.state.summary.length; i++) {
      if (this.state.summary[i].isRightWrong === 'correct') {
        correctAnswers += 1;
      }
    }
    return correctAnswers;
  }

  // used as callback @ fetchQuestionnaire, fetchAnswers
  updateCurrentStep = (step) => {
    let stateCopy = { ...this.state };
    stateCopy.currentStep = step;
    this.setState(stateCopy);
  }

  // fetches first question based on selected survey
  fetchQuestionnaire = (step) => {
    let stateCopy = { ...this.state };
    stateCopy.questionnaire = stateCopy.questionnaires.filter(q => { return q.id === stateCopy.selectedQuestionnaireId });
    this.setState(stateCopy, () => { console.log(this.state); this.updateCurrentStep(step) })
  }

  fetchFirstQuestion = (step) => {
    QuestionAPI.readById(this.state.questionnaire[0].firstQuestionId, (err, data) => {
      if (err) console.log(err);
      let stateCopy = { ...this.state };
      if (data.Items.length === 0) {
        alert('no question found!');
        stateCopy.currentStep = 'index';
      } else {
        stateCopy.question = data.Items;
      }
      this.setState(stateCopy, () => { this.fetchAnswers(step) });
    })
  }


  /*-------------------------------methods for Question component----------------------------------------*/


  // used as callback @ fetchFirstQuestion, fetchQuestion 
  fetchAnswers = (step) => {
    AnswerAPI.getById(this.state.question[0].id, (err, data) => {
      if(err) console.log(err);
      let stateCopy = {...this.state};
      console.log(data);
      stateCopy.answers = data;
      this.setState(stateCopy, () => {this.updateCurrentStep(step)})
    })
  }

  fetchQuestion = (step) => {
    QuestionAPI.readById(this.state.selectedAnswer[0].childQuestion, (err, data) => {
      if (err) console.log(err);
      let stateCopy = { ...this.state };
      if (data.Items.length === 0 && this.state.type === 'survey') {
        stateCopy.question = [];
        stateCopy.currentStep = 'results';
      } else if (data.Items.length === 0 && this.state.type === 'quiz') {
        stateCopy.question = [];
        stateCopy.currentStep = 'quizResults';
        stateCopy.totalCountOfQuestions = this.state.summary.length;
        stateCopy.countCorrect = this.countCorrectAnswers();
      } else {
        stateCopy.question = data.Items;
      }
      this.setState(stateCopy, () => { this.fetchAnswers(step) });
    })
  }

  selectAnswer = (id) => {
    stateCopy = { ...this.state };
    stateCopy.selectedAnswer = stateCopy.answers.filter(a => { return a.id === id });
    this.setState(stateCopy, () => { console.log(this.state) });
  }

  submitAnswer = (step) => {
    this.fetchQuestion(step);
  }

  checkAnswer = () => {
    if (this.state.selectedAnswer.length > 0) {
      if (this.state.type === 'quiz') {
        this.setState({
          modalVisible: true,
          correctAnswer: this.state.answers.find(a => {return this.state.question[0].correctAnswerId === a.id})
        })
      }
      else {
        this.saveAnswerSelection();
      }
    }
  }

  saveAnswerSelection = () => {

    let step = "question";
    let result = '';
    let correctAnswer = '';

    if (this.state.selectedAnswer[0].id === this.state.question[0].correctAnswerId) {
      result = 'correct';
    } else {
      result = 'incorrect';
      //find and store correct answer
      for (let i = 0; i < this.state.answers.length; i++) {
        if (this.state.question[0].correctAnswerId === this.state.answers[i].id) {
          correctAnswer = this.state.answers[i].content;
        }
      }
    }

    let qa = {
      questionText: this.state.question[0].content,
      answerText: this.state.selectedAnswer[0].content,
      isRightWrong: result,
      correctAnswer: correctAnswer
    };
    this.saveToSummary(qa, step);

  }

  // qa(question & answer pair)
  saveToSummary = (qa, step) => {
    stateCopy = { ...this.state };
    stateCopy.summary.push(qa);
    stateCopy.modalVisible = false;
    this.setState(stateCopy, () => { console.log(this.state); this.submitAnswer(step) });
  }

  onExitButtonPress = () => {
    let step = 'index'
    let stateCopy = { ...this.state };
    stateCopy.type = '';
    stateCopy.summary = [];
    this.setState(stateCopy, () => { console.log(this.state); this.updateCurrentStep(step) })
  }

  /*---  render  ---*/


  render () {
    return (
      <View style={styles.container}>

        {/* ---index screen--- */}
        {
          this.state.currentStep === 'index' &&
          <Index
            questionnaires={this.state.questionnaires}
            selectedQuestionnaireId={this.state.selectedQuestionnaireId}
            type={this.state.type}
            title={this.state.title}

            onPickerValueChange={this.onPickerValueChange}
            updateSelectedQuestionnaireId={this.updateSelectedQuestionnaireId}
            fetchQuestionnaire={this.fetchQuestionnaire}
          />
        }

        {/* ---intro screen--- */}
        {
          this.state.currentStep === 'intro' &&
          <Intro
            updateCurrentStep={this.updateCurrentStep}
            questionnaire={this.state.questionnaire}
            fetchFirstQuestion={this.fetchFirstQuestion}
          />
        }

        {/* ---question screen--- */}
        {
          this.state.currentStep === 'question' && this.state.question.length !== 0 &&
          <Question
            question={this.state.question}
            answers={this.state.answers}
            selectedAnswerId={this.state.selectedAnswerId}
            selectedAnswer={this.state.selectedAnswer}
            selectAnswer={this.selectAnswer}
            checkAnswer={this.checkAnswer}
            saveAnswerSelection={this.saveAnswerSelection}
            fetchQuestion={this.fetchQuestion}
            modalVisible={this.state.modalVisible}
            correctAnswer={this.state.correctAnswer}
          />
        }

        {/* ---result screen--- */}
        {
          this.state.currentStep === 'results' && this.state.question.length === 0 &&
          <SurveyResults
            saveToSummary={this.saveToSummary}
            onExitButtonPress={this.onExitButtonPress}
          />
        }
        {/* ---quiz result screen--- */}
        {
          this.state.currentStep === 'quizResults' && this.state.question.length === 0 &&
          <QuizResults
            quizTitle={this.state.selectedQuestionnaireTitle}
            totalCountOfQuestions={this.state.totalCountOfQuestions}
            countCorrect={this.state.countCorrect}
            quizResults={this.state.summary}
            onExitButtonPress={this.onExitButtonPress}
          />
        }

      </View>
    );
  }
}

export default App;
