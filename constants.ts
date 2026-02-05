import { LessonType, FileType, LessonData, CodeSegment, Language } from './types';

// Helper to create segments easily
const bp = (text: string): CodeSegment => ({ text, type: 'auto' });
const code = (text: string): CodeSegment => ({ text, type: 'type' });

const DEFAULT_FILE_ORDER: FileType[] = [
      FileType.PROCESSOR_H,
      FileType.PROCESSOR_CPP,
      FileType.EDITOR_H,
      FileType.EDITOR_CPP,
];

const DEFAULT_FILE_LANGUAGES: Record<FileType, 'c_cpp'> = {
      [FileType.PROCESSOR_H]: 'c_cpp',
      [FileType.PROCESSOR_CPP]: 'c_cpp',
      [FileType.EDITOR_H]: 'c_cpp',
      [FileType.EDITOR_CPP]: 'c_cpp',
};

export const UI_LABELS = {
      [Language.EN]: {
            title: "JUCE Typing Tutor",
            homeTyping: "Start Typing",
            homeCreate: "Add Typing Content",
            createTitle: "Create a Typing Lesson",
            createNameLabel: "Title",
            createDescriptionLabel: "Description",
            createContentLabel: "Typing Content",
            createLineTypeLabel: "Line Type",
            createTagsLabel: "Tags",
            createFileNameLabel: "File name",
            createFileLanguageLabel: "Language",
            createAddFileButton: "Add File",
            createRemoveFileButton: "Remove",
            createSaveButton: "Save Changes",
            createEditButton: "Edit",
            createDeleteButton: "Delete",
            createNewButton: "New Lesson",
            createCancelEdit: "Cancel Edit",
            createAddButton: "Add Lesson",
            createBack: "Back to Home",
            createHint: "Choose which lines are auto-filled (auto) or typed by the user (type).",
            createError: "Please fill in all fields.",
            wpm: "WPM",
            accuracy: "Accuracy",
            backToMenu: "Back to Menu",
            startCoding: "Start Coding →",
            codeComplete: "Code Complete!",
            tryAgain: "Choose Lesson",
            typos: "Typos",
            footer: "Learn C++ and JUCE by typing. Press any key to start.",
            language: "Language",
            analyzing: "Analyzing C++ Logic...",
            closeTutor: "Close Tutor",
            explainCode: "Explain Code",
            tags: ["C++", "DSP"]
      },
      [Language.JP]: {
            title: "JUCE タイピング道場",
            homeTyping: "タイピングを開始",
            homeCreate: "タイピング内容を追加",
            createTitle: "タイピング内容の作成",
            createNameLabel: "名前",
            createDescriptionLabel: "説明",
            createContentLabel: "タイピング内容",
            createLineTypeLabel: "行の種別",
            createTagsLabel: "タグ",
            createFileNameLabel: "ファイル名",
            createFileLanguageLabel: "使用言語",
            createAddFileButton: "ファイル追加",
            createRemoveFileButton: "削除",
            createSaveButton: "変更を保存",
            createEditButton: "編集",
            createDeleteButton: "削除",
            createNewButton: "新規作成",
            createCancelEdit: "編集をキャンセル",
            createAddButton: "追加",
            createBack: "はじめの画面に戻る",
            createHint: "auto は自動入力、type はユーザーがタイプする行です。",
            createError: "入力が不足しています。",
            wpm: "WPM",
            accuracy: "正確性",
            backToMenu: "メニューに戻る",
            startCoding: "コーディング開始 →",
            codeComplete: "課題クリア！",
            tryAgain: "内容を選ぶ",
            typos: "タイプミス",
            footer: "タイピングでC++とJUCEを学びましょう。キーを押してスタート。",
            language: "言語 (Language)",
            analyzing: "C++ロジックを解析中...",
            closeTutor: "解説を閉じる",
            explainCode: "コード解説",
            tags: ["C++", "信号処理"]
      }
};

// --- ENGLISH LESSONS ---

const FILTER_LESSON_EN: LessonData = {
      id: LessonType.FILTER,
      title: "Filter Plugin",
      description: "A complete LowPass/HighPass filter plugin using juce::dsp modules.",
      tags: UI_LABELS[Language.EN].tags,
      fileLanguages: DEFAULT_FILE_LANGUAGES,
      files: {
            [FileType.PROCESSOR_H]: [
                  bp(`#pragma once

#include <JuceHeader.h>

class AudioPluginAudioProcessor : public juce::AudioProcessor
{
public:
    AudioPluginAudioProcessor();
    ~AudioPluginAudioProcessor() override;

    void prepareToPlay (double sampleRate, int samplesPerBlock) override;
    void releaseResources() override;

    bool isBusesLayoutSupported (const BusesLayout& layouts) const override;

    void processBlock (juce::AudioBuffer<float>&, juce::MidiBuffer&) override;

    juce::AudioProcessorEditor* createEditor() override;
    bool hasEditor() const override;

    const juce::String getName() const override;

    bool acceptsMidi() const override;
    bool producesMidi() const override;
    bool isMidiEffect() const override;
    double getTailLengthSeconds() const override;

    int getNumPrograms() override;
    int getCurrentProgram() override;
    void setCurrentProgram (int index) override;
    const juce::String getProgramName (int index) override;
    void changeProgramName (int index, const juce::String& newName) override;

    void getStateInformation (juce::MemoryBlock& destData) override;
    void setStateInformation (const void* data, int sizeInBytes) override;

`),
                  bp(`    // APVTS (AudioProcessorValueTreeState) manages all our parameters (knobs/sliders).
    // It handles the connection between the DSP value and the GUI, and also saving/loading presets.
`),
                  code(`    juce::AudioProcessorValueTreeState apvts;`),
                  bp(`

private:
`),
                  bp(`    // This function is where we define what parameters exist (e.g., "Cutoff", "Resonance").
`),
                  code(`    juce::AudioProcessorValueTreeState::ParameterLayout createParameterLayout();

`),
                  bp(`    // -- DSP Signal Chain Definitions --
    // We use juce::dsp modules for better performance and readability.
    // 'IIR::Filter' is an Infinite Impulse Response filter (standard digital filter type).
`),
                  code(`    using Filter = juce::dsp::IIR::Filter<float>;
`),
                  bp(`    // 'ProcessorChain' lets us stack multiple filters in series.
    // Here we stack 4 filters to create a steeper slope (each filter is usually 12dB/octave).
`),
                  code(`    using CutFilter = juce::dsp::ProcessorChain<Filter, Filter, Filter, Filter>;
`),
                  bp(`    // The MonoChain contains the full signal path: LowCut -> Parametric Peak -> HighCut.
`),
                  code(`    using MonoChain = juce::dsp::ProcessorChain<CutFilter, Filter, CutFilter>;`),
                  bp(`
    
    // We need one chain for the Left ear and one for the Right ear (Stereo).
`),
                  code(`    MonoChain leftChain, rightChain;`),
                  bp(`
    
    // Enums to help us access the specific filter within the chain by name.
`),
                  code(`    enum ChainPositions
    {
        LowCut,
        Peak,
        HighCut
    };`),
                  bp(`
    
    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR (AudioPluginAudioProcessor)
};`)
            ],

            [FileType.PROCESSOR_CPP]: [
                  bp(`#include "PluginProcessor.h"
#include "PluginEditor.h"

`),
                  bp(`AudioPluginAudioProcessor::AudioPluginAudioProcessor()
#ifndef JucePlugin_PreferredChannelConfigurations
     : AudioProcessor (BusesProperties()
                     .withInput  ("Input",  juce::AudioChannelSet::stereo(), true)
                     .withOutput ("Output", juce::AudioChannelSet::stereo(), true)),
`),
                  bp(`       // Initialize APVTS with 'this' processor, no undo manager, "Parameters" as ID, and our layout.
`),
                  code(`       apvts(*this, nullptr, "Parameters", createParameterLayout())`),
                  bp(`
#endif
{
}

AudioPluginAudioProcessor::~AudioPluginAudioProcessor()
{
}

`),
                  bp(`// Defines the parameters (knobs) available in the plugin.
`),
                  code(`juce::AudioProcessorValueTreeState::ParameterLayout AudioPluginAudioProcessor::createParameterLayout()
{
    juce::AudioProcessorValueTreeState::ParameterLayout layout;`),
                  bp(`
    
    // Add a Float parameter for Cutoff Frequency.
    // Range: 20Hz to 20000Hz. Default: 1000Hz.
    // The '0.25f' skew factor makes the knob feel logarithmic (better for frequency control).
`),
                  code(`    layout.add(std::make_unique<juce::AudioParameterFloat>("Cutoff", "Cutoff", 
                                                           juce::NormalisableRange<float>(20.f, 20000.f, 1.f, 0.25f), 
                                                           1000.f));
                                                           
    return layout;
}

`),
                  bp(`// prepareToPlay is called once before audio starts flowing.
// We must initialize our DSP objects here with the sample rate and block size.
`),
                  code(`void AudioPluginAudioProcessor::prepareToPlay (double sampleRate, int samplesPerBlock)
{`),
                  bp(`
    // ProcessSpec passes essential info to the DSP modules.
`),
                  code(`    juce::dsp::ProcessSpec spec;
    spec.maximumBlockSize = samplesPerBlock;`),
                  bp(`
    spec.numChannels = 1; // Processing mono chains individually
`),
                  code(`    spec.sampleRate = sampleRate;
    
    leftChain.prepare(spec);
    rightChain.prepare(spec);
}

`),
                  bp(`void AudioPluginAudioProcessor::releaseResources()
{
}

bool AudioPluginAudioProcessor::isBusesLayoutSupported (const BusesLayout& layouts) const
{
    if (layouts.getMainOutputChannelSet() != juce::AudioChannelSet::mono()
     && layouts.getMainOutputChannelSet() != juce::AudioChannelSet::stereo())
        return false;

    if (layouts.getMainOutputChannelSet() != layouts.getMainInputChannelSet())
        return false;

    return true;
}

`),
                  bp(`// processBlock is the audio loop. It runs thousands of times per second.
// 'buffer' contains the audio samples. We modify them in place.
`),
                  code(`void AudioPluginAudioProcessor::processBlock (juce::AudioBuffer<float>& buffer, juce::MidiBuffer& midiMessages)
{
`),
                  bp(`    // Prevents performance issues with extremely small floating point numbers (denormals).
`),
                  code(`    juce::ScopedNoDenormals noDenormals;
    auto totalNumInputChannels  = getTotalNumInputChannels();
    auto totalNumOutputChannels = getTotalNumOutputChannels();

`),
                  bp(`    // Clear any extra output channels that don't have input data (safety cleanup).
`),
                  code(`    for (auto i = totalNumInputChannels; i < totalNumOutputChannels; ++i)
        buffer.clear (i, 0, buffer.getNumSamples());

`),
                  bp(`    // juce::dsp::AudioBlock wraps the buffer to work with DSP modules.
`),
                  code(`    juce::dsp::AudioBlock<float> block(buffer);
    auto leftBlock = block.getSingleChannelBlock(0);
    auto rightBlock = block.getSingleChannelBlock(1);
    
`),
                  bp(`    // ProcessContextReplacing indicates we are reading AND writing to the same buffer.
`),
                  code(`    juce::dsp::ProcessContextReplacing<float> leftContext(leftBlock);
    juce::dsp::ProcessContextReplacing<float> rightContext(rightBlock);`),
                  bp(`
    
    // In a real plugin, you would get parameter values from 'apvts' here 
    // and update the filter coefficients before processing.
    
    // Execute the DSP chain
`),
                  code(`    leftChain.process(leftContext);
    rightChain.process(rightContext);
}

`),
                  bp(`bool AudioPluginAudioProcessor::hasEditor() const
{
    return true;
}

juce::AudioProcessorEditor* AudioPluginAudioProcessor::createEditor()
{
    return new AudioPluginAudioProcessorEditor (*this);
}

`),
                  bp(`// Save the plugin state (parameters) to a memory block.
`),
                  code(`void AudioPluginAudioProcessor::getStateInformation (juce::MemoryBlock& destData)
{
    auto state = apvts.copyState();
    std::unique_ptr<juce::XmlElement> xml (state.createXml());
    copyXmlToBinary (*xml, destData);
}

`),
                  bp(`// Restore the plugin state from memory (e.g., when loading a project).
`),
                  code(`void AudioPluginAudioProcessor::setStateInformation (const void* data, int sizeInBytes)
{
    std::unique_ptr<juce::XmlElement> xmlState (getXmlFromBinary (data, sizeInBytes));
    if (xmlState.get() != nullptr)
        if (xmlState->hasTagName (apvts.state.getType()))
            apvts.replaceState (juce::ValueTree::fromXml (*xmlState));
}

`),
                  bp(`// Boilerplate getters
const juce::String AudioPluginAudioProcessor::getName() const { return JucePlugin_Name; }
bool AudioPluginAudioProcessor::acceptsMidi() const { return false; }
bool AudioPluginAudioProcessor::producesMidi() const { return false; }
bool AudioPluginAudioProcessor::isMidiEffect() const { return false; }
double AudioPluginAudioProcessor::getTailLengthSeconds() const { return 0.0; }
int AudioPluginAudioProcessor::getNumPrograms() { return 1; }
int AudioPluginAudioProcessor::getCurrentProgram() { return 0; }
void AudioPluginAudioProcessor::setCurrentProgram (int index) {}
const juce::String AudioPluginAudioProcessor::getProgramName (int index) { return {}; }
void AudioPluginAudioProcessor::changeProgramName (int index, const juce::String& newName) {}

juce::AudioProcessor* JUCE_CALLTYPE createPluginFilter()
{
    return new AudioPluginAudioProcessor();
}`)
            ],

            [FileType.EDITOR_H]: [
                  bp(`#pragma once

#include <JuceHeader.h>
#include "PluginProcessor.h"

class AudioPluginAudioProcessorEditor : public juce::AudioProcessorEditor
{
public:
    AudioPluginAudioProcessorEditor (AudioPluginAudioProcessor&);
    ~AudioPluginAudioProcessorEditor() override;

    void paint (juce::Graphics&) override;
    void resized() override;

private:
    AudioPluginAudioProcessor& audioProcessor;
`),
                  bp(`    // UI Components
`),
                  code(`    juce::Slider cutoffSlider;
    juce::Label cutoffLabel;
    
`),
                  bp(`    // Attachment: Connects the Slider directly to the APVTS parameter.
    // This handles all the logic of updating the DSP when the slider moves.
`),
                  code(`    std::unique_ptr<juce::AudioProcessorValueTreeState::SliderAttachment> cutoffAttachment;`),
                  bp(`

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR (AudioPluginAudioProcessorEditor)
};`)
            ],

            [FileType.EDITOR_CPP]: [
                  bp(`#include "PluginProcessor.h"
#include "PluginEditor.h"

`),
                  code(`AudioPluginAudioProcessorEditor::AudioPluginAudioProcessorEditor (AudioPluginAudioProcessor& p)
    : AudioProcessorEditor (&p), audioProcessor (p)
{
    cutoffSlider.setSliderStyle(juce::Slider::RotaryHorizontalVerticalDrag);
    cutoffSlider.setTextBoxStyle(juce::Slider::NoTextBox, false, 0, 0);
    addAndMakeVisible(cutoffSlider);
    
    cutoffLabel.setText("Frequency", juce::dontSendNotification);
    cutoffLabel.setJustificationType(juce::Justification::centred);
    addAndMakeVisible(cutoffLabel);
    
`),
                  bp(`    // Connect the 'cutoffSlider' to the parameter named "Cutoff" in apvts.
`),
                  code(`    cutoffAttachment = std::make_unique<juce::AudioProcessorValueTreeState::SliderAttachment>(audioProcessor.apvts, "Cutoff", cutoffSlider);
    
    setSize (400, 300);
}

AudioPluginAudioProcessorEditor::~AudioPluginAudioProcessorEditor()
{
}

`),
                  code(`void AudioPluginAudioProcessorEditor::paint (juce::Graphics& g)
{
    g.fillAll (juce::Colours::black);
    
    g.setColour(juce::Colours::white);
    g.setFont(20.0f);
    g.drawFittedText("Simple Filter", getLocalBounds().removeFromTop(40), juce::Justification::centred, 1);
}

`),
                  code(`void AudioPluginAudioProcessorEditor::resized()
{
    auto bounds = getLocalBounds();`),
                  bp(`
    bounds.removeFromTop(40); // Title area
`),
                  code(`    
    auto sliderArea = bounds.reduced(40);
    
    cutoffLabel.setBounds(sliderArea.removeFromTop(20));
    cutoffSlider.setBounds(sliderArea);
}`)
            ]
      },
      fileOrder: DEFAULT_FILE_ORDER
};

const SYNTH_LESSON_EN: LessonData = {
      id: LessonType.SYNTH,
      title: "Synthesizer Plugin",
      description: "A complete synthesizer plugin with MIDI input and sound generation.",
      tags: UI_LABELS[Language.EN].tags,
      fileLanguages: DEFAULT_FILE_LANGUAGES,
      files: {
            [FileType.PROCESSOR_H]: [
                  bp(`#pragma once

#include <JuceHeader.h>

class AudioPluginAudioProcessor : public juce::AudioProcessor
{
public:
    AudioPluginAudioProcessor();
    ~AudioPluginAudioProcessor() override;

    void prepareToPlay (double sampleRate, int samplesPerBlock) override;
    void releaseResources() override;

    bool isBusesLayoutSupported (const BusesLayout& layouts) const override;

    void processBlock (juce::AudioBuffer<float>&, juce::MidiBuffer&) override;

    juce::AudioProcessorEditor* createEditor() override;
    bool hasEditor() const override;

    const juce::String getName() const override;

    bool acceptsMidi() const override;
    bool producesMidi() const override;
    bool isMidiEffect() const override;
    double getTailLengthSeconds() const override;

    int getNumPrograms() override;
    int getCurrentProgram() override;
    void setCurrentProgram (int index) override;
    const juce::String getProgramName (int index) override;
    void changeProgramName (int index, const juce::String& newName) override;

    void getStateInformation (juce::MemoryBlock& destData) override;
    void setStateInformation (const void* data, int sizeInBytes) override;
    
`),
                  code(`    juce::MidiKeyboardState& getKeyboardState() { return keyboardState; }`),
                  bp(`

private:
`),
                  bp(`    // juce::Synthesiser handles the complex logic of voice allocation, 
    // stealing voices when too many notes are played, and managing MIDI.
`),
                  code(`    juce::Synthesiser synth;

`),
                  bp(`    // Keeps track of which keys are currently pressed on the on-screen keyboard.
`),
                  code(`    juce::MidiKeyboardState keyboardState;
    
    void initialiseSynth();`),
                  bp(`
    
    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR (AudioPluginAudioProcessor)
};`)
            ],

            [FileType.PROCESSOR_CPP]: [
                  bp(`#include "PluginProcessor.h"
#include "PluginEditor.h"

// Simple Sine Wave Voice Class
`),
                  bp(`// 'SynthesiserSound' describes *what* sound can be played.
// For a simple synth, it just validates if a note/channel is allowed.
`),
                  code(`struct SineWaveSound : public juce::SynthesiserSound
{
    bool appliesToNote (int) override { return true; }
    bool appliesToChannel (int) override { return true; }
};

`),
                  bp(`// 'SynthesiserVoice' describes *how* to generate the audio for a single note.
// The Synthesiser class manages multiple instances (voices) of this to allow polyphony (chords).
`),
                  code(`struct SineWaveVoice : public juce::SynthesiserVoice
{
    bool canPlaySound (juce::SynthesiserSound* sound) override
    {
        return dynamic_cast<SineWaveSound*> (sound) != nullptr;
    }

`),
                  bp(`    // Called when a new note starts. We calculate the pitch frequency here.
`),
                  code(`    void startNote (int midiNoteNumber, float velocity, juce::SynthesiserSound*, int /*currentPitchWheelPosition*/) override
    {
        currentAngle = 0.0;
        level = velocity * 0.15;
        tailOff = 0.0;`),
                  bp(`

        // Convert MIDI note (0-127) to Hertz (Frequency).
`),
                  code(`        auto cyclesPerSecond = juce::MidiMessage::getMidiNoteInHertz (midiNoteNumber);
        auto cyclesPerSample = cyclesPerSecond / getSampleRate();`),
                  bp(`
        
        // Calculate how much the angle of the sine wave increments per sample.
`),
                  code(`        angleDelta = cyclesPerSample * 2.0 * juce::MathConstants<double>::pi;
    }

`),
                  bp(`    // Called when the key is released.
`),
                  code(`    void stopNote (float /*velocity*/, bool allowTailOff) override
    {
        if (allowTailOff)
        {`),
                  bp(`
            // Start the release phase (fade out)
`),
                  code(`            if (tailOff == 0.0)
                tailOff = 1.0;
        }
        else
        {`),
                  bp(`
            // Stop immediately
`),
                  code(`            clearCurrentNote();
            angleDelta = 0.0;
        }
    }

`),
                  bp(`    // The audio generation loop for this specific voice.
`),
                  code(`    void renderNextBlock (juce::AudioBuffer<float>& outputBuffer, int startSample, int numSamples) override
    {
        if (angleDelta != 0.0)
        {`),
                  bp(`
            // If the note is being released (fading out)
`),
                  code(`            if (tailOff > 0.0)
            {
                while (--numSamples >= 0)
                {`),
                  bp(`
                    // Generate sine wave: sin(angle) * amplitude
`),
                  code(`                    auto currentSample = (float) (std::sin (currentAngle) * level * tailOff);`),
                  bp(`
                    
                    // Add this voice's sample to all output channels
`),
                  code(`                    for (auto i = outputBuffer.getNumChannels(); --i >= 0;)
                        outputBuffer.addSample (i, startSample, currentSample);

                    currentAngle += angleDelta;
                    ++startSample;`),
                  bp(`
                    tailOff *= 0.99; // Simple exponential decay
`),
                  code(`
                    if (tailOff <= 0.005)
                    {`),
                  bp(`
                        clearCurrentNote(); // Note finished
`),
                  code(`                        angleDelta = 0.0;
                        break;
                    }
                }
            }`),
                  bp(`
            else // Normal sustain phase
`),
                  code(`            {
                while (--numSamples >= 0)
                {
                    auto currentSample = (float) (std::sin (currentAngle) * level);
                    for (auto i = outputBuffer.getNumChannels(); --i >= 0;)
                        outputBuffer.addSample (i, startSample, currentSample);

                    currentAngle += angleDelta;
                    ++startSample;
                }
            }
        }
    }
    
    void pitchWheelMoved (int) override {}
    void controllerMoved (int, int) override {}

private:
    double currentAngle = 0.0, angleDelta = 0.0, level = 0.0, tailOff = 0.0;
};

`),
                  bp(`AudioPluginAudioProcessor::AudioPluginAudioProcessor()
#ifndef JucePlugin_PreferredChannelConfigurations
     : AudioProcessor (BusesProperties()
                     .withInput  ("Input",  juce::AudioChannelSet::stereo(), true)
                     .withOutput ("Output", juce::AudioChannelSet::stereo(), true))
#endif
{
`),
                  code(`    initialiseSynth();`),
                  bp(`
}

AudioPluginAudioProcessor::~AudioPluginAudioProcessor()
{
}

`),
                  bp(`// Setup the synthesizer voices and sounds.
`),
                  code(`void AudioPluginAudioProcessor::initialiseSynth()
{
    synth.clearVoices();`),
                  bp(`
    
    // Add 5 voices = We can play 5 notes simultaneously (Polyphony).
`),
                  code(`    for (int i = 0; i < 5; i++)
        synth.addVoice(new SineWaveVoice());
        
    synth.clearSounds();
    synth.addSound(new SineWaveSound());
}

`),
                  code(`void AudioPluginAudioProcessor::prepareToPlay (double sampleRate, int samplesPerBlock)
{
    synth.setCurrentPlaybackSampleRate(sampleRate);
}

`),
                  bp(`void AudioPluginAudioProcessor::releaseResources()
{
}

bool AudioPluginAudioProcessor::isBusesLayoutSupported (const BusesLayout& layouts) const
{
    return true; // Simplified for synth
}

`),
                  code(`void AudioPluginAudioProcessor::processBlock (juce::AudioBuffer<float>& buffer, juce::MidiBuffer& midiMessages)
{
    juce::ScopedNoDenormals noDenormals;
    auto totalNumInputChannels  = getTotalNumInputChannels();
    auto totalNumOutputChannels = getTotalNumOutputChannels();

    for (auto i = totalNumInputChannels; i < totalNumOutputChannels; ++i)
        buffer.clear (i, 0, buffer.getNumSamples());
        
`),
                  bp(`    // Add MIDI events from the on-screen keyboard to the incoming MIDI buffer.
    // 'true' means we are injecting these events.
`),
                  code(`    keyboardState.processNextMidiBuffer(midiMessages, 0, buffer.getNumSamples(), true);
    
`),
                  bp(`    // The synth object parses the MIDI messages and generates audio into the buffer.
`),
                  code(`    synth.renderNextBlock(buffer, midiMessages, 0, buffer.getNumSamples());
}

`),
                  bp(`bool AudioPluginAudioProcessor::hasEditor() const
{
    return true;
}

juce::AudioProcessorEditor* AudioPluginAudioProcessor::createEditor()
{
    return new AudioPluginAudioProcessorEditor (*this);
}

void AudioPluginAudioProcessor::getStateInformation (juce::MemoryBlock& destData) {}
void AudioPluginAudioProcessor::setStateInformation (const void* data, int sizeInBytes) {}

const juce::String AudioPluginAudioProcessor::getName() const { return JucePlugin_Name; }

`),
                  code(`bool AudioPluginAudioProcessor::acceptsMidi() const { return true; }`),

                  bp(`
bool AudioPluginAudioProcessor::producesMidi() const { return false; }
bool AudioPluginAudioProcessor::isMidiEffect() const { return false; }
double AudioPluginAudioProcessor::getTailLengthSeconds() const { return 0.0; }
int AudioPluginAudioProcessor::getNumPrograms() { return 1; }
int AudioPluginAudioProcessor::getCurrentProgram() { return 0; }
void AudioPluginAudioProcessor::setCurrentProgram (int index) {}
const juce::String AudioPluginAudioProcessor::getProgramName (int index) { return {}; }
void AudioPluginAudioProcessor::changeProgramName (int index, const juce::String& newName) {}

juce::AudioProcessor* JUCE_CALLTYPE createPluginFilter()
{
    return new AudioPluginAudioProcessor();
}`)
            ],

            [FileType.EDITOR_H]: [
                  bp(`#pragma once

#include <JuceHeader.h>
#include "PluginProcessor.h"

class AudioPluginAudioProcessorEditor : public juce::AudioProcessorEditor
{
public:
    AudioPluginAudioProcessorEditor (AudioPluginAudioProcessor&);
    ~AudioPluginAudioProcessorEditor() override;

    void paint (juce::Graphics&) override;
    void resized() override;

private:
    AudioPluginAudioProcessor& audioProcessor;
`),
                  bp(`    // A built-in JUCE component that displays a clickable piano keyboard.
`),
                  code(`    juce::MidiKeyboardComponent keyboardComponent;`),
                  bp(`

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR (AudioPluginAudioProcessorEditor)
};`)
            ],

            [FileType.EDITOR_CPP]: [
                  bp(`#include "PluginProcessor.h"
#include "PluginEditor.h"

`),
                  code(`AudioPluginAudioProcessorEditor::AudioPluginAudioProcessorEditor (AudioPluginAudioProcessor& p)
    : AudioProcessorEditor (&p), audioProcessor (p),
      keyboardComponent (p.getKeyboardState(), juce::MidiKeyboardComponent::horizontalKeyboard)
{
    addAndMakeVisible(keyboardComponent);
    setSize (600, 300);
}

AudioPluginAudioProcessorEditor::~AudioPluginAudioProcessorEditor()
{
}

`),
                  code(`void AudioPluginAudioProcessorEditor::paint (juce::Graphics& g)
{
    g.fillAll (juce::Colours::black);
    
    g.setColour(juce::Colours::white);
    g.setFont(24.0f);
    g.drawFittedText("Simple Synth", getLocalBounds().removeFromTop(50), juce::Justification::centred, 1);
}

`),
                  code(`void AudioPluginAudioProcessorEditor::resized()
{
    auto bounds = getLocalBounds();
    keyboardComponent.setBounds(bounds.removeFromBottom(100));
}`)
            ]
      },
      fileOrder: DEFAULT_FILE_ORDER
};


// --- JAPANESE LESSONS ---

const FILTER_LESSON_JP: LessonData = {
      id: LessonType.FILTER,
      title: "フィルタープラグイン",
      description: "juce::dspモジュールを使用した完全なローパス/ハイパスフィルタープラグイン。",
      tags: UI_LABELS[Language.JP].tags,
      fileLanguages: DEFAULT_FILE_LANGUAGES,
      files: {
            [FileType.PROCESSOR_H]: [
                  bp(`#pragma once

#include <JuceHeader.h>

class AudioPluginAudioProcessor : public juce::AudioProcessor
{
public:
    AudioPluginAudioProcessor();
    ~AudioPluginAudioProcessor() override;

    void prepareToPlay (double sampleRate, int samplesPerBlock) override;
    void releaseResources() override;

    bool isBusesLayoutSupported (const BusesLayout& layouts) const override;

    void processBlock (juce::AudioBuffer<float>&, juce::MidiBuffer&) override;

    juce::AudioProcessorEditor* createEditor() override;
    bool hasEditor() const override;

    const juce::String getName() const override;

    bool acceptsMidi() const override;
    bool producesMidi() const override;
    bool isMidiEffect() const override;
    double getTailLengthSeconds() const override;

    int getNumPrograms() override;
    int getCurrentProgram() override;
    void setCurrentProgram (int index) override;
    const juce::String getProgramName (int index) override;
    void changeProgramName (int index, const juce::String& newName) override;

    void getStateInformation (juce::MemoryBlock& destData) override;
    void setStateInformation (const void* data, int sizeInBytes) override;

`),
                  bp(`    // APVTS (AudioProcessorValueTreeState) は、すべてのパラメータ（ノブやスライダー）を管理します。
    // DSPの値とGUIの接続、およびプリセットの保存/読み込みも処理します。
`),
                  code(`    juce::AudioProcessorValueTreeState apvts;`),
                  bp(`

private:
`),
                  bp(`    // この関数で、どのようなパラメータ（例：「カットオフ」、「レゾナンス」）が存在するかを定義します。
`),
                  code(`    juce::AudioProcessorValueTreeState::ParameterLayout createParameterLayout();

`),
                  bp(`    // -- DSPシグナルチェーンの定義 --
    // パフォーマンスと可読性向上のため、juce::dspモジュールを使用します。
    // 'IIR::Filter' は無限インパルス応答フィルター（標準的なデジタルフィルター）です。
`),
                  code(`    using Filter = juce::dsp::IIR::Filter<float>;
`),
                  bp(`    // 'ProcessorChain' を使用すると、複数のフィルターを直列に重ねることができます。
    // ここでは4つのフィルターを重ねて、より急峻なスロープ（通常、各フィルターは12dB/oct）を作成します。
`),
                  code(`    using CutFilter = juce::dsp::ProcessorChain<Filter, Filter, Filter, Filter>;
`),
                  bp(`    // MonoChainには完全な信号経路が含まれます：ローカット -> パラメトリックピーク -> ハイカット。
`),
                  code(`    using MonoChain = juce::dsp::ProcessorChain<CutFilter, Filter, CutFilter>;`),
                  bp(`
    
    // 左耳用と右耳用（ステレオ）に1つずつチェーンが必要です。
`),
                  code(`    MonoChain leftChain, rightChain;`),
                  bp(`
    
    // チェーン内の特定のフィルターに名前でアクセスするためのEnum。
`),
                  code(`    enum ChainPositions
    {
        LowCut,
        Peak,
        HighCut
    };`),
                  bp(`
    
    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR (AudioPluginAudioProcessor)
};`)
            ],

            [FileType.PROCESSOR_CPP]: [
                  bp(`#include "PluginProcessor.h"
#include "PluginEditor.h"

`),
                  bp(`AudioPluginAudioProcessor::AudioPluginAudioProcessor()
#ifndef JucePlugin_PreferredChannelConfigurations
     : AudioProcessor (BusesProperties()
                     .withInput  ("Input",  juce::AudioChannelSet::stereo(), true)
                     .withOutput ("Output", juce::AudioChannelSet::stereo(), true)),
`),
                  bp(`       // APVTSを初期化します。'this'プロセッサ、Undoマネージャなし、IDは"Parameters"、そしてレイアウトを渡します。
`),
                  code(`       apvts(*this, nullptr, "Parameters", createParameterLayout())`),
                  bp(`
#endif
{
}

AudioPluginAudioProcessor::~AudioPluginAudioProcessor()
{
}

`),
                  bp(`// プラグインで使用可能なパラメータ（ノブ）を定義します。
`),
                  code(`juce::AudioProcessorValueTreeState::ParameterLayout AudioPluginAudioProcessor::createParameterLayout()
{
    juce::AudioProcessorValueTreeState::ParameterLayout layout;`),
                  bp(`
    
    // カットオフ周波数用のFloatパラメータを追加します。
    // 範囲：20Hz〜20000Hz。デフォルト：1000Hz。
    // '0.25f' のスキュー係数により、ノブの操作感が対数的になります（周波数制御に適しています）。
`),
                  code(`    layout.add(std::make_unique<juce::AudioParameterFloat>("Cutoff", "Cutoff", 
                                                           juce::NormalisableRange<float>(20.f, 20000.f, 1.f, 0.25f), 
                                                           1000.f));
                                                           
    return layout;
}

`),
                  bp(`// prepareToPlay は音声が流れ始める前に一度だけ呼び出されます。
// ここでサンプルレートとブロックサイズを使用してDSPオブジェクトを初期化する必要があります。
`),
                  code(`void AudioPluginAudioProcessor::prepareToPlay (double sampleRate, int samplesPerBlock)
{`),
                  bp(`
    // ProcessSpec はDSPモジュールに必須の情報を渡します。
`),
                  code(`    juce::dsp::ProcessSpec spec;
    spec.maximumBlockSize = samplesPerBlock;`),
                  bp(`
    spec.numChannels = 1; // モノラルチェーンを個別に処理するため
`),
                  code(`    spec.sampleRate = sampleRate;
    
    leftChain.prepare(spec);
    rightChain.prepare(spec);
}

`),
                  bp(`void AudioPluginAudioProcessor::releaseResources()
{
}

bool AudioPluginAudioProcessor::isBusesLayoutSupported (const BusesLayout& layouts) const
{
    if (layouts.getMainOutputChannelSet() != juce::AudioChannelSet::mono()
     && layouts.getMainOutputChannelSet() != juce::AudioChannelSet::stereo())
        return false;

    if (layouts.getMainOutputChannelSet() != layouts.getMainInputChannelSet())
        return false;

    return true;
}

`),
                  bp(`// processBlock はオーディオループです。1秒間に何千回も実行されます。
// 'buffer' にはオーディオサンプルが含まれています。これをその場で変更します。
`),
                  code(`void AudioPluginAudioProcessor::processBlock (juce::AudioBuffer<float>& buffer, juce::MidiBuffer& midiMessages)
{
`),
                  bp(`    // 極端に小さい浮動小数点数（非正規化数）によるパフォーマンス低下を防ぎます。
`),
                  code(`    juce::ScopedNoDenormals noDenormals;
    auto totalNumInputChannels  = getTotalNumInputChannels();
    auto totalNumOutputChannels = getTotalNumOutputChannels();

`),
                  bp(`    // 入力データのない余分な出力チャンネルをクリアします（安全のためのクリーンアップ）。
`),
                  code(`    for (auto i = totalNumInputChannels; i < totalNumOutputChannels; ++i)
        buffer.clear (i, 0, buffer.getNumSamples());

`),
                  bp(`    // juce::dsp::AudioBlock はバッファをラップしてDSPモジュールと連携します。
`),
                  code(`    juce::dsp::AudioBlock<float> block(buffer);
    auto leftBlock = block.getSingleChannelBlock(0);
    auto rightBlock = block.getSingleChannelBlock(1);
    
`),
                  bp(`    // ProcessContextReplacing は、同じバッファに対して読み取りと書き込みを行うことを示します。
`),
                  code(`    juce::dsp::ProcessContextReplacing<float> leftContext(leftBlock);
    juce::dsp::ProcessContextReplacing<float> rightContext(rightBlock);`),
                  bp(`
    
    // 実際のプラグインでは、ここで 'apvts' からパラメータ値を取得し、
    // 処理の前にフィルター係数を更新します。
    
    // DSPチェーンを実行
`),
                  code(`    leftChain.process(leftContext);
    rightChain.process(rightContext);
}

`),
                  bp(`bool AudioPluginAudioProcessor::hasEditor() const
{
    return true;
}

juce::AudioProcessorEditor* AudioPluginAudioProcessor::createEditor()
{
    return new AudioPluginAudioProcessorEditor (*this);
}

`),
                  bp(`// プラグインの状態（パラメータ）をメモリブロックに保存します。
`),
                  code(`void AudioPluginAudioProcessor::getStateInformation (juce::MemoryBlock& destData)
{
    auto state = apvts.copyState();
    std::unique_ptr<juce::XmlElement> xml (state.createXml());
    copyXmlToBinary (*xml, destData);
}

`),
                  bp(`// メモリからプラグインの状態を復元します（プロジェクトの読み込み時など）。
`),
                  code(`void AudioPluginAudioProcessor::setStateInformation (const void* data, int sizeInBytes)
{
    std::unique_ptr<juce::XmlElement> xmlState (getXmlFromBinary (data, sizeInBytes));
    if (xmlState.get() != nullptr)
        if (xmlState->hasTagName (apvts.state.getType()))
            apvts.replaceState (juce::ValueTree::fromXml (*xmlState));
}

`),
                  bp(`// 定型的なゲッター
const juce::String AudioPluginAudioProcessor::getName() const { return JucePlugin_Name; }
bool AudioPluginAudioProcessor::acceptsMidi() const { return false; }
bool AudioPluginAudioProcessor::producesMidi() const { return false; }
bool AudioPluginAudioProcessor::isMidiEffect() const { return false; }
double AudioPluginAudioProcessor::getTailLengthSeconds() const { return 0.0; }
int AudioPluginAudioProcessor::getNumPrograms() { return 1; }
int AudioPluginAudioProcessor::getCurrentProgram() { return 0; }
void AudioPluginAudioProcessor::setCurrentProgram (int index) {}
const juce::String AudioPluginAudioProcessor::getProgramName (int index) { return {}; }
void AudioPluginAudioProcessor::changeProgramName (int index, const juce::String& newName) {}

juce::AudioProcessor* JUCE_CALLTYPE createPluginFilter()
{
    return new AudioPluginAudioProcessor();
}`)
            ],

            [FileType.EDITOR_H]: [
                  bp(`#pragma once

#include <JuceHeader.h>
#include "PluginProcessor.h"

class AudioPluginAudioProcessorEditor : public juce::AudioProcessorEditor
{
public:
    AudioPluginAudioProcessorEditor (AudioPluginAudioProcessor&);
    ~AudioPluginAudioProcessorEditor() override;

    void paint (juce::Graphics&) override;
    void resized() override;

private:
    AudioPluginAudioProcessor& audioProcessor;
`),
                  bp(`    // UIコンポーネント
`),
                  code(`    juce::Slider cutoffSlider;
    juce::Label cutoffLabel;
    
`),
                  bp(`    // Attachment: スライダーをAPVTSパラメータに直接接続します。
    // スライダーが動いたときのDSP更新ロジックをすべて処理します。
`),
                  code(`    std::unique_ptr<juce::AudioProcessorValueTreeState::SliderAttachment> cutoffAttachment;`),
                  bp(`

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR (AudioPluginAudioProcessorEditor)
};`)
            ],

            [FileType.EDITOR_CPP]: [
                  bp(`#include "PluginProcessor.h"
#include "PluginEditor.h"

`),
                  code(`AudioPluginAudioProcessorEditor::AudioPluginAudioProcessorEditor (AudioPluginAudioProcessor& p)
    : AudioProcessorEditor (&p), audioProcessor (p)
{
    cutoffSlider.setSliderStyle(juce::Slider::RotaryHorizontalVerticalDrag);
    cutoffSlider.setTextBoxStyle(juce::Slider::NoTextBox, false, 0, 0);
    addAndMakeVisible(cutoffSlider);
    
    cutoffLabel.setText("Frequency", juce::dontSendNotification);
    cutoffLabel.setJustificationType(juce::Justification::centred);
    addAndMakeVisible(cutoffLabel);
    
`),
                  bp(`    // 'cutoffSlider' をapvts内の "Cutoff" という名前のパラメータに接続します。
`),
                  code(`    cutoffAttachment = std::make_unique<juce::AudioProcessorValueTreeState::SliderAttachment>(audioProcessor.apvts, "Cutoff", cutoffSlider);
    
    setSize (400, 300);
}

AudioPluginAudioProcessorEditor::~AudioPluginAudioProcessorEditor()
{
}

`),
                  code(`void AudioPluginAudioProcessorEditor::paint (juce::Graphics& g)
{
    g.fillAll (juce::Colours::black);
    
    g.setColour(juce::Colours::white);
    g.setFont(20.0f);
    g.drawFittedText("Simple Filter", getLocalBounds().removeFromTop(40), juce::Justification::centred, 1);
}

`),
                  code(`void AudioPluginAudioProcessorEditor::resized()
{
    auto bounds = getLocalBounds();`),
                  bp(`
    bounds.removeFromTop(40); // タイトルエリア
`),
                  code(`    
    auto sliderArea = bounds.reduced(40);
    
    cutoffLabel.setBounds(sliderArea.removeFromTop(20));
    cutoffSlider.setBounds(sliderArea);
}`)
            ]
      },
      fileOrder: DEFAULT_FILE_ORDER
};

const SYNTH_LESSON_JP: LessonData = {
      id: LessonType.SYNTH,
      title: "シンセサイザープラグイン",
      description: "MIDI入力と発音機能を備えた完全なシンセサイザープラグイン。",
      tags: UI_LABELS[Language.JP].tags,
      fileLanguages: DEFAULT_FILE_LANGUAGES,
      files: {
            [FileType.PROCESSOR_H]: [
                  bp(`#pragma once

#include <JuceHeader.h>

class AudioPluginAudioProcessor : public juce::AudioProcessor
{
public:
    AudioPluginAudioProcessor();
    ~AudioPluginAudioProcessor() override;

    void prepareToPlay (double sampleRate, int samplesPerBlock) override;
    void releaseResources() override;

    bool isBusesLayoutSupported (const BusesLayout& layouts) const override;

    void processBlock (juce::AudioBuffer<float>&, juce::MidiBuffer&) override;

    juce::AudioProcessorEditor* createEditor() override;
    bool hasEditor() const override;

    const juce::String getName() const override;

    bool acceptsMidi() const override;
    bool producesMidi() const override;
    bool isMidiEffect() const override;
    double getTailLengthSeconds() const override;

    int getNumPrograms() override;
    int getCurrentProgram() override;
    void setCurrentProgram (int index) override;
    const juce::String getProgramName (int index) override;
    void changeProgramName (int index, const juce::String& newName) override;

    void getStateInformation (juce::MemoryBlock& destData) override;
    void setStateInformation (const void* data, int sizeInBytes) override;
    
`),
                  code(`    juce::MidiKeyboardState& getKeyboardState() { return keyboardState; }`),
                  bp(`

private:
`),
                  bp(`    // juce::Synthesiser は、ボイスアロケーション（発音割り当て）、
    // 同時発音数を超えたときのボイスの奪い取り、MIDI管理などの複雑なロジックを処理します。
`),
                  code(`    juce::Synthesiser synth;

`),
                  bp(`    // オンスクリーンキーボードで現在押されているキーを追跡します。
`),
                  code(`    juce::MidiKeyboardState keyboardState;
    
    void initialiseSynth();`),
                  bp(`
    
    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR (AudioPluginAudioProcessor)
};`)
            ],

            [FileType.PROCESSOR_CPP]: [
                  bp(`#include "PluginProcessor.h"
#include "PluginEditor.h"

// 単純なサイン波ボイスクラス
`),
                  bp(`// 'SynthesiserSound' は *何* の音が再生可能かを記述します。
// 単純なシンセの場合、ノート/チャンネルが許可されているかを検証するだけです。
`),
                  code(`struct SineWaveSound : public juce::SynthesiserSound
{
    bool appliesToNote (int) override { return true; }
    bool appliesToChannel (int) override { return true; }
};

`),
                  bp(`// 'SynthesiserVoice' は、単一のノートのオーディオを *どうやって* 生成するかを記述します。
// Synthesiserクラスはこれの複数のインスタンス（ボイス）を管理し、ポリフォニー（和音）を可能にします。
`),
                  code(`struct SineWaveVoice : public juce::SynthesiserVoice
{
    bool canPlaySound (juce::SynthesiserSound* sound) override
    {
        return dynamic_cast<SineWaveSound*> (sound) != nullptr;
    }

`),
                  bp(`    // 新しいノートが開始されたときに呼ばれます。ここでピッチ周波数を計算します。
`),
                  code(`    void startNote (int midiNoteNumber, float velocity, juce::SynthesiserSound*, int /*currentPitchWheelPosition*/) override
    {
        currentAngle = 0.0;
        level = velocity * 0.15;
        tailOff = 0.0;`),
                  bp(`

        // MIDIノート (0-127) をヘルツ (周波数) に変換します。
`),
                  code(`        auto cyclesPerSecond = juce::MidiMessage::getMidiNoteInHertz (midiNoteNumber);
        auto cyclesPerSample = cyclesPerSecond / getSampleRate();`),
                  bp(`
        
        // サイン波の角度が1サンプルごとにどれだけ増加するかを計算します。
`),
                  code(`        angleDelta = cyclesPerSample * 2.0 * juce::MathConstants<double>::pi;
    }

`),
                  bp(`    // キーが離されたときに呼ばれます。
`),
                  code(`    void stopNote (float /*velocity*/, bool allowTailOff) override
    {
        if (allowTailOff)
        {`),
                  bp(`
            // リリースフェーズ（フェードアウト）を開始します
`),
                  code(`            if (tailOff == 0.0)
                tailOff = 1.0;
        }
        else
        {`),
                  bp(`
            // 即座に停止します
`),
                  code(`            clearCurrentNote();
            angleDelta = 0.0;
        }
    }

`),
                  bp(`    // この特定のボイスのオーディオ生成ループです。
`),
                  code(`    void renderNextBlock (juce::AudioBuffer<float>& outputBuffer, int startSample, int numSamples) override
    {
        if (angleDelta != 0.0)
        {`),
                  bp(`
            // ノートがリリース中（フェードアウト中）の場合
`),
                  code(`            if (tailOff > 0.0)
            {
                while (--numSamples >= 0)
                {`),
                  bp(`
                    // サイン波の生成: sin(angle) * amplitude
`),
                  code(`                    auto currentSample = (float) (std::sin (currentAngle) * level * tailOff);`),
                  bp(`
                    
                    // このボイスのサンプルをすべての出力チャンネルに追加します
`),
                  code(`                    for (auto i = outputBuffer.getNumChannels(); --i >= 0;)
                        outputBuffer.addSample (i, startSample, currentSample);

                    currentAngle += angleDelta;
                    ++startSample;`),
                  bp(`
                    tailOff *= 0.99; // 単純な指数関数的減衰
`),
                  code(`
                    if (tailOff <= 0.005)
                    {`),
                  bp(`
                        clearCurrentNote(); // ノート終了
`),
                  code(`                        angleDelta = 0.0;
                        break;
                    }
                }
            }`),
                  bp(`
            else // 通常のサステインフェーズ
`),
                  code(`            {
                while (--numSamples >= 0)
                {
                    auto currentSample = (float) (std::sin (currentAngle) * level);
                    for (auto i = outputBuffer.getNumChannels(); --i >= 0;)
                        outputBuffer.addSample (i, startSample, currentSample);

                    currentAngle += angleDelta;
                    ++startSample;
                }
            }
        }
    }
    
    void pitchWheelMoved (int) override {}
    void controllerMoved (int, int) override {}

private:
    double currentAngle = 0.0, angleDelta = 0.0, level = 0.0, tailOff = 0.0;
};

`),
                  bp(`AudioPluginAudioProcessor::AudioPluginAudioProcessor()
#ifndef JucePlugin_PreferredChannelConfigurations
     : AudioProcessor (BusesProperties()
                     .withInput  ("Input",  juce::AudioChannelSet::stereo(), true)
                     .withOutput ("Output", juce::AudioChannelSet::stereo(), true))
#endif
{
`),
                  code(`    initialiseSynth();`),
                  bp(`
}

AudioPluginAudioProcessor::~AudioPluginAudioProcessor()
{
}

`),
                  bp(`// シンセサイザーのボイスとサウンドをセットアップします。
`),
                  code(`void AudioPluginAudioProcessor::initialiseSynth()
{
    synth.clearVoices();`),
                  bp(`
    
    // 5つのボイスを追加 = 5音同時に演奏可能（ポリフォニー）。
`),
                  code(`    for (int i = 0; i < 5; i++)
        synth.addVoice(new SineWaveVoice());
        
    synth.clearSounds();
    synth.addSound(new SineWaveSound());
}

`),
                  code(`void AudioPluginAudioProcessor::prepareToPlay (double sampleRate, int samplesPerBlock)
{
    synth.setCurrentPlaybackSampleRate(sampleRate);
}

`),
                  bp(`void AudioPluginAudioProcessor::releaseResources()
{
}

bool AudioPluginAudioProcessor::isBusesLayoutSupported (const BusesLayout& layouts) const
{
    return true; // シンセ用に簡略化
}

`),
                  code(`void AudioPluginAudioProcessor::processBlock (juce::AudioBuffer<float>& buffer, juce::MidiBuffer& midiMessages)
{
    juce::ScopedNoDenormals noDenormals;
    auto totalNumInputChannels  = getTotalNumInputChannels();
    auto totalNumOutputChannels = getTotalNumOutputChannels();

    for (auto i = totalNumInputChannels; i < totalNumOutputChannels; ++i)
        buffer.clear (i, 0, buffer.getNumSamples());
        
`),
                  bp(`    // オンスクリーンキーボードからのMIDIイベントを入力MIDIバッファに追加します。
    // 'true' はこれらのイベントを注入することを意味します。
`),
                  code(`    keyboardState.processNextMidiBuffer(midiMessages, 0, buffer.getNumSamples(), true);
    
`),
                  bp(`    // シンセオブジェクトがMIDIメッセージを解析し、バッファにオーディオを生成します。
`),
                  code(`    synth.renderNextBlock(buffer, midiMessages, 0, buffer.getNumSamples());
}

`),
                  bp(`bool AudioPluginAudioProcessor::hasEditor() const
{
    return true;
}

juce::AudioProcessorEditor* AudioPluginAudioProcessor::createEditor()
{
    return new AudioPluginAudioProcessorEditor (*this);
}

void AudioPluginAudioProcessor::getStateInformation (juce::MemoryBlock& destData) {}
void AudioPluginAudioProcessor::setStateInformation (const void* data, int sizeInBytes) {}

const juce::String AudioPluginAudioProcessor::getName() const { return JucePlugin_Name; }

`),
                  code(`bool AudioPluginAudioProcessor::acceptsMidi() const { return true; }`),

                  bp(`
bool AudioPluginAudioProcessor::producesMidi() const { return false; }
bool AudioPluginAudioProcessor::isMidiEffect() const { return false; }
double AudioPluginAudioProcessor::getTailLengthSeconds() const { return 0.0; }
int AudioPluginAudioProcessor::getNumPrograms() { return 1; }
int AudioPluginAudioProcessor::getCurrentProgram() { return 0; }
void AudioPluginAudioProcessor::setCurrentProgram (int index) {}
const juce::String AudioPluginAudioProcessor::getProgramName (int index) { return {}; }
void AudioPluginAudioProcessor::changeProgramName (int index, const juce::String& newName) {}

juce::AudioProcessor* JUCE_CALLTYPE createPluginFilter()
{
    return new AudioPluginAudioProcessor();
}`)
            ],

            [FileType.EDITOR_H]: [
                  bp(`#pragma once

#include <JuceHeader.h>
#include "PluginProcessor.h"

class AudioPluginAudioProcessorEditor : public juce::AudioProcessorEditor
{
public:
    AudioPluginAudioProcessorEditor (AudioPluginAudioProcessor&);
    ~AudioPluginAudioProcessorEditor() override;

    void paint (juce::Graphics&) override;
    void resized() override;

private:
    AudioPluginAudioProcessor& audioProcessor;
`),
                  bp(`    // 組み込みのJUCEコンポーネント。クリック可能なピアノ鍵盤を表示します。
`),
                  code(`    juce::MidiKeyboardComponent keyboardComponent;`),
                  bp(`

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR (AudioPluginAudioProcessorEditor)
};`)
            ],

            [FileType.EDITOR_CPP]: [
                  bp(`#include "PluginProcessor.h"
#include "PluginEditor.h"

`),
                  code(`AudioPluginAudioProcessorEditor::AudioPluginAudioProcessorEditor (AudioPluginAudioProcessor& p)
    : AudioProcessorEditor (&p), audioProcessor (p),
      keyboardComponent (p.getKeyboardState(), juce::MidiKeyboardComponent::horizontalKeyboard)
{
    addAndMakeVisible(keyboardComponent);
    setSize (600, 300);
}

AudioPluginAudioProcessorEditor::~AudioPluginAudioProcessorEditor()
{
}

`),
                  code(`void AudioPluginAudioProcessorEditor::paint (juce::Graphics& g)
{
    g.fillAll (juce::Colours::black);
    
    g.setColour(juce::Colours::white);
    g.setFont(24.0f);
    g.drawFittedText("Simple Synth", getLocalBounds().removeFromTop(50), juce::Justification::centred, 1);
}

`),
                  code(`void AudioPluginAudioProcessorEditor::resized()
{
    auto bounds = getLocalBounds();
    keyboardComponent.setBounds(bounds.removeFromBottom(100));
}`)
            ]
      },
      fileOrder: DEFAULT_FILE_ORDER
};

export const getLessons = (lang: Language): LessonData[] => {
      return lang === Language.JP
            ? [FILTER_LESSON_JP, SYNTH_LESSON_JP]
            : [FILTER_LESSON_EN, SYNTH_LESSON_EN];
};
