import { describe, it, expect, beforeAll, afterEach } from "vitest";
import {formatScore} from "../src/formatScore.js";

describe("formatScore", () => {
    it("regular", async () => {
        expect(formatScore({
            "winner": "DRAW",
            "duration": "REGULAR",
            "fullTime": {
                "home": 2,
                "away": 2
            },
            "halfTime": {
                "home": 0,
                "away": 1
            }
        })).toEqual('2:2')
    })

    it("extra-time", async () => {
        expect(formatScore({
            "winner": "HOME_TEAM",
            "duration": "EXTRA_TIME",
            "fullTime": {
                "home": 4,
                "away": 3,
            },
            "extraTime": {
                "home": 2,
                "away": 1,
            },
            "regularTime": {
                "home": 2,
                "away": 2,
            },
            "halfTime": {
                "home": 1,
                "away": 1,
            }
        })).toEqual('4:3 (aet)')
    })

    it("penalties", async () => {
        expect(formatScore({
            "winner": "HOME_TEAM",
            "duration": "PENALTY_SHOOTOUT",
            "penalties": {
                "home": 5,
                "away": 4
            },
            "fullTime": {
                "home": 8,
                "away": 7,
            },
            "extraTime": {
                "home": 1,
                "away": 1,
            },
            "regularTime": {
                "home": 2,
                "away": 2,
            },
            "halfTime": {
                "home": 1,
                "away": 1,
            }
        })).toEqual('3:3 (5-4)')
    })
})
