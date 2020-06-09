/**
 * Game Object
 *
 * Holds all functionality to record matches (games).
 *
 * Steps:
 * 1. Log match, (creates match number, sets pending status, and adds 4 users in pending status)
 * 2. Confirm Match (each user confirms their standings in the match.  This is called 4 times total)
 * 3. Commit Match (this puts the match into an accepted status and performs match calculations)
 */

module.exports = {

    /**
     * Logs a new match to the season.
     */
    logMatch() {

    },

    /**
     * Confirms match against a user.
     */
    confirmMatch() {

    },

    /**
     * Commits match, and performs all point calculations
     */
    commitMatch() {

    },

    /**
     * Deletes an unconfirmed match
     */
    deleteMatch() {

    },

    /**
     * Display info about a match
     */
    matchInfo() {

    },

    /**
     * remind users of unconfirmed matches
     */
    remind() {

    },

    /**
     * Update a player's deck for a given match
     */
    updateDeck() {

    },

    /**
     * Creates a unique 6 digit alphanumeric match number
     */
    createMatchNumber() {

    }

}