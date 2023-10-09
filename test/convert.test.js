const { midiParts } = require('./midi-parts')
import MidiWriter from 'midi-writer-js'
import path from 'path'
import fs from 'fs'

import * as check from '../src/checks'

import * as ActTinPan from '../src/actions/tin-pan'

describe("SynMidi to .mid", () => {
    it("converts syn values to MidiWriter values", () => {
        midiParts.forEach(([spec, melody]) => {
            let result = ActTinPan.toSpool(melody)  
            expect(check.is.track(result)).toBe(true)
        })
    })
    
    it("Writes a midifile from synthony data", () => {
        expect(midiParts).toBeDefined()
        expect(Array.isArray(midiParts)).toBe(true)
        const tickDur = MidiWriter.Utils.getTickDuration("4")
        const tracks = midiParts.map(([spec, melody]) => {
            let t = ActTinPan.toMidiTrack(melody)
            t.addEvent(new MidiWriter.ProgramChangeEvent({instrument: 119}));
            return t

        }, [])
        tracks.forEach(t => console.log(t))

        const write = new MidiWriter.Writer(tracks);
        const buffer = new Buffer.from(write.buildFile());
        const p = path.resolve("./test-midi-out.mid")

        fs.writeFileSync(p, buffer, function (err) {
            if (err) throw err;
            console.log("completed midi file writing")
        });
    })
})
