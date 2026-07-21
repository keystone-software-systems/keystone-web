# Ubility: Questions for Mike

Hi Mike, thanks again for walking me through the setup. I've spent some time in the six repositories and
put together a picture of how the system fits together. Below are the places where I'm inferring things
from the code and would rather confirm with you than assume, plus a few operational questions that will
help me lay out realistic options for Steve.

No rush on any single one. Partial answers are fine, and "I'm not sure" is a perfectly good answer for
anything that was outside your area.

---

## How the pieces connect

1. **What actually triggers a bill scrape?** I can see `c4-backend` calling `c4-scrape`, but I can't tell
   whether that's on a schedule, on-demand when a resident's bill is due, or kicked off from somewhere else
   (a queue, a timer job). What sets it off?
2. **Does anything besides `c4-backend` call `c4-extract`?** Or is the backend the only caller of the PDF
   extraction service?
3. **Where does the marketing site's contact form actually go?** A CRM, an email inbox, a Ubility endpoint,
   something else?
4. **Does the investor site (`ubility-ai`) log in against `c4-backend`?** The route shape looks like the
   same ASP.NET API, but I haven't confirmed the two are pointed at each other in production.
5. **Are there other consumers of the backend API** I wouldn't see from these six repositories? A mobile
   app, a partner integration, a reporting tool, anything else that talks to it.

## Deployment and environments

6. **How does the backend get deployed to the Windows VM?** Manual publish, a script, any CI/CD, or was it
   whatever the previous engineer did by hand?
7. **Is there a staging or test environment, or is production the only one?**
8. **How is the frontend deployed,** and where is it hosted?

## The database and stored procedures

9. **Are the SQL stored procedures kept in source control anywhere,** or do they only exist in the live RDS
   database? I don't see them versioned in the repos.
10. **How do database changes get made today?** Directly against the database, through migration scripts,
    or some other process?
11. **Are there regular backups of the SQL Server database,** and has a restore ever been tested?

## Operations

12. **Are there scheduled or background jobs** running anywhere (Windows Task Scheduler, cron, a service)
    that aren't obvious from the repositories?
13. **Is there any monitoring, logging, or alerting in place** that tells you when something breaks in
    production, or is it mostly found when someone reports it?
14. **Who holds the AWS account and the domain/DNS access?** Just making sure access is available when it's
    needed.
15. **Who owns the credentials for the third-party integrations** (Yardi, RealPage, Entrata, RentManager,
    Bill.com, Forte, QuickBooks, Stripe)? Are those Ubility's own accounts, or set up under someone else?

## Scale and usage

16. **Roughly how much is the system handling today?** Number of properties or residents, and roughly how
    many bills processed a month. Ballpark is fine. This helps me size what "scaling" actually needs to
    mean.

## Documentation

17. **Is there any existing documentation, runbook, or notes** from the previous engineer, even informal?
    Anything at all is useful.

---

Whatever you can fill in helps. Happy to hop on a call instead if that's easier than writing it out.
