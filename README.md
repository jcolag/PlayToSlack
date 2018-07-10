# PlayToSlack

A silly tool to convert a script in (specific) HTML to JSON files that resemble a Slack export.

## Background

I've been working on [a program to back up Slack messages](https://github.com/jcolag/SlackBackup) and, as I show the program to colleagues, have started to realize that using my data could expose information on the people I interact with.  So, I wanted a source of data to use for demonstrations.

The obvious solution for an available source for people communicating over time would be a play, and the HTML for [Pygmalion](http://www.gutenberg.org/ebooks/3825) is nicely structured for such a task.

## Modifications

In the aforementioned HTML file, the relevant types of content are `dialog` (which is what we want), `stage` (stage directions), and `noindent` (general information, I think).  This doesn't quite take care of all the necessary situations, so I've added three new kinds of items:

 * `time`:  A timestamp when the following dialog starts.  For example, based on internal evidence and the date on which it was written, there's a fairly good chance that the opening scene of _Pygmalion_ was meant to take place at `1907-08-16 23:15`.

 * `place`:  This is suggestive of a location, but is really closer to how _SlackBackup_ stores a Slack conversation.  So, places in the context of _Pygmalion_ might be `im-Colonel-Pickering` or `channel-Wimpole-Lab`.

 * `delay`:  This is the maximum amount of time (in seconds) between messages in the section, which defaults to five minutes.  This allows the results to be flexible, either cramming in a lot of dialogue in a short stretch or letting the content spread over a longer period as might be realistic for an online team.

## Configuration

Because there are a lot of "moving parts" in a fairly small program, many of the features are configurable and pushed into a file called `config.json`.  This repository ships with a file that works for the Pygmalion file, of course.

The properties in the file are:

 * `delay`:  This is the default delay, as mentioned previously.

 * `source`:  The file to read the play from, such as "./Pygmalion.html".

 * `team`:  The Slack-like team name, which _SlackBackup_ will use for headings.

 * `team_id`:  A Slack-like ID, which can basically be anything, but should _probably_ be unique to the team in case a program downstream uses it to distinguish between teams.

 * `tz`:  The text-based time zone name, from [Wikipedia's list](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones), such as "Europe/London" or "America/New_York."

 * `tz_label`:  The formal name of the time zone.

 * `tz_offset`:  The offset from the generated timestamps to use in display.

 * `url`:  The URL for the Slack team, which is probably never going to be used by anybody, so won't matter.

 * `user`:  The name of the user whose perspective is taken by _SlackBackup_.  In _Pygmalion_, since Henry Higgins in nearly every scene, the user is set to "henry."

 * `users`:  The grouping of pre-defined characters in the play, the contents of which are used to generate the user files.  The group is represented by a JSON object where each character is a property named for the character (specifically, the lowercase version of how they're identified in the script, with all the spaces and periods removed).  The character sub-objects, then, have the following properties:

   * `id`:  This is another Slack-like ID.  They should be unique to identify characters, but can largely be anything.  Future versions may return the option to generate the ID if it isn't supplied, but the current needs were to have a mostly-predictable output.

   * `name`:  This is the "user name" of the character, mostly irrelevant, though used to generate some file names.

   * `color`:  The color (RGB) to use when displaying references to the character in _SlackBackup_.  Slack generates colors for each user behind the scenes, and this mimics that.  Like the `id`, _PlayToSlack_ has the ability to generate these colors, and may in the future generate them when not supplied in this configuration.

   * `real_name`:  Lastly, we have the actual full name of the character, which is what will be shown on-screen when the character is referenced.

Note that, if _PlayToSlack_ discovers any characters not configured, it will create a mock-up user file that can be renamed and edited later, if desired.

## Running

After downloading, run `npm install` in this folder to get the handful of required packages.  If you're not using _Pygmalion_, fix up the play you're using in the aforementioned format and update `config.json`.  Then, simply run:

 > `node playtojson.js`

_PlayToSlack_ will create a folder named for the configured team and place all resulting JSON content in there.  You can then copy/move this folder to wherever _SlackBackup_ is configured to look and see the results.

## Future

Mostly, if I keep working on this (not entirely likely, since it does what I need, but one never knows), this could stand to be more flexible.

 * As mentioned above, it wouldn't be difficult to generate missing items as needed.

 * The ability to work with multiple configuration files would be convenient.

 * Other script formats would be nice, particularly [Fountain](https://fountain.io/), not to mention working with HTML scripts that aren't in as rigorous a format as _Pygmalion_ happened to be.

 * The code hasn't gone through any linting and is _barely_ commented, since it was all thrown together and "debugged into existence."  It wouldn't be terrible to clean this up.

If you want to add any of this (or anything else), please feel free.  I don't see it as _particularly_ useful, but for the handful of places it fits, it would be nice if it fit well.

