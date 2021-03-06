import React from 'react';
import { shallow } from 'enzyme';
import jasmineEzyme from 'jasmine-enzyme';
import Chip from 'material-ui/Chip';
import sinon from 'sinon';

import Question from 'app/observers/Question';
import QuestionModel from 'app/stores/objects/Question';
import CodeEditor from 'app/components/CodeEditor';


describe('Question observer', () => {
  let question;

  beforeEach(() => {
    jasmineEzyme();
    question = new QuestionModel(null, {
      id: 0,
      language: 'javascript',
      answer: 'default answer',
      question: 'Default question.',
      default_answer: 'default answer',
    });
  });

  it('should display code editor with question data', () => {
    const wrapper = shallow(<Question number={1} question={question} />);
    const codeEditor = wrapper.find(CodeEditor);
    expect(codeEditor.length).toBe(1);
    expect(codeEditor.node.props.answer).toBe(question.answer);
  });

  it('should display information whether the question is saved or not', () => {
    question.isSaved = true;
    const wrapper = shallow((
      <Question number={1} question={question} />
    )).dive();

    expect(wrapper.find(Chip)).toHaveProp('children', 'Saved');
  });

  it('should react on changes in question status', () => {
    const wrapper = shallow((
      <Question number={1} question={question} />
    ));

    expect(wrapper.dive().find(Chip).length).toBe(0);

    question.isSaving = true;
    expect(wrapper.dive().find(Chip)).toHaveProp('children', 'saving...');

    question.isSaving = false;
    question.isSaved = true;
    expect(wrapper.dive().find(Chip)).toHaveProp('children', 'Saved');
  });

  it('should assure that code editor is readOnly if question is submitted', () => {
    const wrapper = shallow(<Question number={1} question={question} submitted />);
    const editor = wrapper.find(CodeEditor);
    expect(editor.node.props.readOnly).toBe(true);
  });

  it('should show reset question button if quiz is not submitted and question was changed', () => {
    const wrapper = shallow(<Question number={1} question={question} />);
    expect(wrapper.find('.question__reset').length).toBe(0);

    question.answer = 'new content';
    expect(wrapper.find('.question__reset').length).toBe(1);

    wrapper.setProps({ submitted: true });
    expect(wrapper.find('.question__reset').length).toBe(0);
  });

  it('should save question when code editor is saved', () => {
    const saveStub = sinon.stub(question, 'save');
    const wrapper = shallow(<Question number={1} question={question} />);
    wrapper.find(CodeEditor).node.props.onSave();
    expect(saveStub.calledOnce).toBe(true);
  });

  it('should update question answer when code editor changes', () => {
    const changeStub = sinon.stub(question, 'changeAnswer');
    const wrapper = shallow(<Question number={1} question={question} />);
    wrapper.find(CodeEditor).node.props.onChange('new content');
    expect(changeStub.calledOnce).toBe(true);
  });

  it('should change question content to default when reset button clicked', () => {
    const resetStub = sinon.stub(question, 'resetToDefault');
    question.changeAnswer('not default');
    const wrapper = shallow(<Question number={1} question={question} />);
    wrapper.find('.question__reset').simulate('click');
    expect(resetStub.calledOnce).toBe(true);
  });

  it('click on the tooltip should not reset question', () => {
    const resetStub = sinon.stub(question, 'resetToDefault');
    question.changeAnswer('not default');
    const wrapper = shallow(<Question number={1} question={question} />);
    wrapper.find('.question__reset-info').simulate('click', { preventDefault() {} });
    expect(resetStub.called).toBe(false);
  });
});
