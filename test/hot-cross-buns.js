var MidiWriter = require('midi-writer-js');

var track = new MidiWriter.Track();
const tickDur = MidiWriter.Utils.getTickDuration("4")

track.addEvent([
			new MidiWriter.NoteEvent({pitch: [50, 54, 57], duration: '4'}),
			new MidiWriter.NoteEvent({pitch: 57, duration: 'T' + (tickDur*2).toString(), wait: 'T' + tickDur.toString()}),
			new MidiWriter.NoteEvent({pitch: 54, duration: 'T' + (tickDur*2).toString(), wait: 'T' + tickDur.toString()}),
			// new MidiWriter.NoteEvent({sequential:false, pitch: [50, 55], duration: '4', wait: 'T' +tickDur}),
			// new MidiWriter.NoteEvent({sequential:false, pitch: 80, duration: '2', wait: 'T' + 4 * tickDur}),
			// new MidiWriter.NoteEvent({pitch: ['E4','D4'], duration: '4'}),
			// new MidiWriter.NoteEvent({pitch: 'C4', duration: '2'}),
			// new MidiWriter.NoteEvent({pitch: ['C4', 'C4', 'C4', 'C4', 'D4', 'D4', 'D4', 'D4'], duration: '8'}),
			// new MidiWriter.NoteEvent({pitch: ['E4','D4'], duration: '4'}),
			// new MidiWriter.NoteEvent({pitch: 'C4', duration: '2'})
	], function(event, index) {
    // return {sequential:true};
  }
);


var write = new MidiWriter.Writer(track);
//console.log(track);
//console.log(write.base64())
console.log(write.dataUri());

module.exports = write;