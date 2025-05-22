# Goal
## Points
I need an app that help you "gamify" your day by adding points for each focused session.
Why points for each focused session? 
Because ADHD people often **wants** to focus but it doesn't mean they **did** actually focus for the whole time
## Stats
The other crucial functionality is the a clear way to show statistics and reports with comparison to previous period
- daily (compared to last day)
- weekly (compared to last week)
- monthly (compared to last month)
# User story
## Start focus session
User enters the app, declare what he's working on and how long he's going to focus.
This starts the *focus session*.
Disclaimer:
- user should be able to start *focus session* even without declaring what he's going to work on or how long. In such situation the session will count everything as overtime.
## Ongoing focus session
When the focus session started user should see something that would calm the ADHD mind.
A nice, calm picture?
A motivational quote?

It shouldn't be dynamic, it should be still and it should not catch the user's attention.
User should be able to:
- edit *focus session*
- end it prematurely
- cancel it
## End focus session
### Rate session
At the end of the *focus session* he gets notification and is asked to judge his effort for the session.
I thought about reviewing the focus session by assigning the session quality as one of these options:
- 💩 Poor
- ⚖️ Normal
- 🔥 Great
- 💠 Deep focus

Why only these? Because it should be simple.
But you can propose a better system if you have an idea.
Also, user should be able to assign optional note
### Extend session
Eventually he can extend the session for however long he wants.
If he doesn't react to notification the session should be automatically extended - **but** the extended time should distinguishable from normal time.
Why? Because the user may not react for notification for mainly two reasons:
1. He's in the deep work, notification silenced, he actually wants to have this extra time counted.
2. He already lost his focus or gone afk and he'd like to count/measure only the original *focus session* time.

After all day user probably wants to copy his all day efforts and paste it into his daily Obsidian note.
So we need to allow copying the whole day report from the whole day (in markdown) into clipboard.
Example:
```
# Focus session 09:00 - 10:00
## Goal
- Fix the bug from ticket WTF-420
- Clean up the desk
## Session quality
💩 Poor
### Notes
Distracted by youtube videos about cars

# Focus session 11:30 - 13:00
## Goal
- Fix the follow-up bugs introduced from WTF-420 fix
## Session quality
💠 Deep focus
### Notes
None
## Overtime
0.5h -> 12:30 - 13:00
```
# Edge cases
## Closing app during focus session
User may close the window while executing the *focus session*.
If user re-opens the app and the *focus session* is still ongoing it should be displayed as ongoing.
If it's ended user should be prompted to review session quality
# UX
Please note that it is app for people for ADHD.
So it should be minimalistic, yet the reviewing or starting focus session should have rewarding (but minimalistic - non distracting) animations that's going to create a good habit of work.
# Technology stack
## If you decide it should be web based
I'm familiar mosty with Vue3 so it's my preferred framework.
You should use possibly the latest frameworks and tool versions.
For linter please use prettier and maybe eslint? IDK what's the top linter for TS right now.
For tests I suggest vitest and playwright.
Can we do it serverless? So the all data is saved in local storage. Is it good idea? Or maybe I should consider something else?
For CSS maybe tailwind? Do you have something better?
Please use pnpm as package manager.
## Git
Please initialize `.gitignore` for the project.
## Future
I consider porting it to iOS and macOS native app in the future as it'd allow people to integrate it with their phones, computers and smartwatches.
But it's not that important right now.
# Technology caveats
If any `node` related command fails - try first to fix it by calling `nvmrc-load`.
# Confirm your plan
Please show me your plan and the technology stack you're going to use.
Wait for my approval and let's move on after that! :)
