# Synth DAW and Sample DAW

This module exposes two interfaces for playing parts: 
synth daw, and  sample daw.

The distinction is necessary, for two reasons:

## 1. Buffer Loading

  As the synth daw is using only local browser resources, 
  while the sample daw works with external* resources. 

  The samples must be loaded into a buffer. I like to cache the loaded buffers so we don't have to reload them for each new note event. 


    *you could also generate buffer data locally. For now assume you read samples from a server.


## 2. a-rate and k-rate controls

Audio rate controls describe events that happen at the sample level, while k-rate are block scoped events. Many samples make up one block. Generally, post-processing audio processes like delay or reverb provide k-rate reads of the input signal while internal synth controls are a-rate. 

How does this relate to WebAudio API?

Let's describe the synth DAW is a-rate and the sample daw is k-rate. 

Both daws know all of the content they will perform when the "play" button is pressed. However, due to the behavior of Oscillator Node, queing these events for each type is different.

The synth daw behaves as you might expect: for each melody, create an oscillator and schedule the changes on that oscillator over time from the note events. Cancelling the playback part way through is fine, as we simply kill the scheduled oscillator. Making a new one is already described in this paragraph. 

The sample daw can't do this as well because each performance of a note requires a new instance of the sampler. 
To use the synth daw model, we have to create all of the osc nodes ahead of time. That's a lotta OscillatorNodes! 

Alternatively, you create one and manage it as a wavetable. You must reset the index of the buffer to position 0 for each new note event. I don't know if this is supported in WebAudio API, but it is an alternative method.

The other caveat is queing these events. 

The synths use a single instance of OscillatorNode, which applies setValueAtTime and manages all of the schedulling internally.

This method for samples uses many unrelated instances of OscillatorNode that are scheduled using setTimeout. 
Cancelling mid performance means all of the timeoutIds must be saved at creation time, so that they can be cancelled when the "pause" button is pressed.

The solution used in this module is to instead only schedule each note immediately, and when it is done playing queue the next note event.

