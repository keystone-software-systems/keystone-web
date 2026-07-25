# Ubility: Security Remediation Proposal


---


## The situation

The recent security review of the six Ubility repositories turned up a set of real, currently exploitable issues, including: live production credentials sitting in git history, an API auth model that amounts to a key shipped to every browser, a path to pulling real customer utility bills through an unvalidated server-side request, and investor financial figures exposed in a public bundle with no real access check behind them.

None of this reflects poorly on the work that's been done. It reflects the reality of a platform developed and maintained as a solo project, without the bandwidth for hardening or the benefit of peer review. The goal here is to close these specific issues, in order of urgency, and hand back a named list of exactly what changed.

The original review also called out that the repos are "functional but under-documented, untested, and have no CI in place." We're not building a full automated test suite as part of this engagement, that's a much larger, longer-horizon effort and there isn't an existing suite to build on. However, for the Keystone team, introducing changes to a production environment without a safety net is not advisable. So we're including a minimal CI pipeline that verifies the application builds cleanly on every change, nothing more. It won't catch logic bugs, but it will catch broken builds before they reach production, which is the immediate risk given there's no staging environment and no other check in place today.

We are also producing comprehensive system architecture documentation. This serves as a foundational asset for the platform, ensuring institutional knowledge is preserved and effectively streamlining future maintenance and onboarding processes.


---


## Approach: three phases

The work is ordered by urgency, not by size. Phase 1 is access and discovery, sorting out exactly what we can get into before committing to fixed pricing on the rest. Phase 2 stops the most exploitable issues within days of that. Phase 3 closes out everything else confirmed in the review over the remaining weeks.


### 


### Phase 1: Access & discovery

This is the one piece of the engagement with real scope uncertainty. If something significant surfaces that materially changes the picture, we'll flag it and check in before continuing rather than let it silently become a bigger phase.


<table>
  <tr>
   <td><strong>#</strong>
   </td>
   <td><strong>Item</strong>
   </td>
  </tr>
  <tr>
   <td>1
   </td>
   <td>Get set up with working AWS IAM credentials (assuming the account's root login is available, and no AWS Support case needed) and confirm database access and permissions. While we're in there, we'll also do a quick pass on basic infrastructure exposure, for example, whether RDP is open to the whole internet on the Windows VM, since that class of issue wouldn't show up in a code-only review and is a common gap on a solo-managed server. Daily backups already exist, which gives us a fallback if anything about the live instance turns out to be harder to access than expected. The initial scope does not include the re-creation, configuration and deployment of a new RDS instance if admin database access turns out not to be possible (referenced in Terms below)
   </td>
  </tr>
  <tr>
   <td>2
   </td>
   <td>Confirm hosting and registrar/DNS access for the backend, frontend, and investor site, then build a real deploy pipeline for the backend and frontend rather than just documenting a manual process. The backend previously deployed straight from the prior engineer's machine with no repeatable process, and the investor site is known to at least be on Amazon EC2, but not the specific setup or how a new build would actually get published there. Automating deploy means production always reflects a known, specific commit instead of whatever was last copied over by hand, safer for the Keystone team to ship changes in parallel, and it means you always know exactly what's running. How far we can automate the backend specifically depends on what we find here, its legacy Windows hosting may need more work than a modern platform would, we'll flag it rather than let that balloon quietly.
   </td>
  </tr>
  <tr>
   <td>3
   </td>
   <td>Stand up the CI side of that pipeline: every change is automatically built and verified before it's allowed to deploy. Build verification only, not a full test suite, there isn't an existing one to run, but combined with item 2 this means nothing reaches production without at least confirming it compiles cleanly first. This is the direct answer to the original review's "no CI in place" finding.
   </td>
  </tr>
</table>



### Phase 2: Stop the bleeding

Fix the issues that are live and exploitable right now


<table>
  <tr>
   <td><strong>#</strong>
   </td>
   <td><strong>Item</strong>
   </td>
  </tr>
  <tr>
   <td>4
   </td>
   <td>Rotate every credential found committed to the backend repo: database passwords, cloud access keys, the AI provider key, and third-party service keys. Some of these (payment processor, accounting, property-management integrations) are contracted through Residence Billing rather than Ubility directly, so rotating them requires coordination with their contact, not just access on Ubility's side.
   </td>
  </tr>
  <tr>
   <td>5
   </td>
   <td>Pull the real financial figures (revenue, burn, funding ask, pipeline) off the public investor site, either by stripping the hardcoded numbers or taking the affected pages offline until a properly gated version exists.
   </td>
  </tr>
  <tr>
   <td>6
   </td>
   <td>Remove open public access from the two backend services that currently accept requests from anyone with no login, and gate both behind a shared secret as an interim measure. This alone closes off the free abuse path for triggering paid AI calls and automated browser jobs.
   </td>
  </tr>
</table>



### Phase 3: Close the confirmed holes


<table>
  <tr>
   <td><strong>#</strong>
   </td>
   <td><strong>Item</strong>
   </td>
  </tr>
  <tr>
   <td>7
   </td>
   <td>Design and implement real per-request authentication for the backend API, replacing the single static key that currently ships to every browser. Likely per-user/service tokens issued at login and validated server-side. Touches both the backend auth layer and the frontend's request logic.
   </td>
  </tr>
  <tr>
   <td>8
   </td>
   <td>Add proper URL validation to the two services that fetch external content on request, closing the path that currently lets an outside caller redirect that server-side fetch, including the one with a real path to exposing customer bill data.
   </td>
  </tr>
  <tr>
   <td>9
   </td>
   <td>Replace the pattern of auth/access tokens encoded (not encrypted) directly into URLs with signed, short-lived tokens or header-based auth. This touches a number of download and report features on both the backend and frontend, and needs regression testing on each affected flow.
   </td>
  </tr>
  <tr>
   <td>10
   </td>
   <td>Fix an access-control gap found beyond the original review: one file-access endpoint has no ownership check at all, meaning a guessable ID could expose another resident's bill. Add the missing check.
   </td>
  </tr>
  <tr>
   <td>11
   </td>
   <td>Purge committed secrets and other sensitive history from git across the affected repos, then coordinate a clean re-clone for anyone with a local copy. This step is disruptive (it rewrites commit history) and needs explicit sign-off before we do it.  We'll preserve commit granularity as much as possible, though every commit hash will still change since the content itself is being rewritten, not just combined.
   </td>
  </tr>
  <tr>
   <td>12
   </td>
   <td>Fix the configuration gaps that let secrets get committed, and remove ~5,300 committed <code>node_modules</code> dependency files from one repo that should never have been tracked in git, bloating the repository and burying the real, current dependency list.
   </td>
  </tr>
  <tr>
   <td>13
   </td>
   <td>Move all remaining secrets out of plaintext config files and into a real secrets manager, with the application reading from it at startup instead.
   </td>
  </tr>
  <tr>
   <td>14
   </td>
   <td>Rebuild the investor site's protected pages as a real server-verified route: confidential content is fetched from an authenticated endpoint after login, not bundled into the public site. May be able to simply remove pages - will confirm with the team before proceeding.
   </td>
  </tr>
  <tr>
   <td>15
   </td>
   <td>Replace the Phase 2 shared-secret stopgap on the two backend services with proper per-caller authentication consistent with item 7, and add basic rate limiting since both trigger real paid work per call.
   </td>
  </tr>
  <tr>
   <td>16
   </td>
   <td>Remove or properly gate a set of diagnostic actions in the backend that currently hit real third-party paid APIs and, in one case, can create a new user account.
   </td>
  </tr>
  <tr>
   <td>17
   </td>
   <td>Finish a cookie/session cleanup that was already in progress before development stopped, confirming no sensitive tokens remain anywhere they shouldn't.
   </td>
  </tr>
</table>



## 


## Timeline

Phase 1 comes first, since everything else depends on actually having access. Phase 2 follows immediately after and closes the most exploitable issues fast. Phase 1 and Phase 2 together are targeted for completion by __August 14__.

Phase 3 is the bulk of the engagement. While one of our engineers has a scheduled leave between __August 15–24__, Keystone Systems will maintain operational continuity. Our engineering team will continue driving the project forward throughout this period, ensuring uninterrupted progress toward the final handoff summary, due no later than__ September 7__.


---


## What you get

A named, itemized __list of exactly what was fixed__, mapped back to this list, so there's a concrete internal record of what changed and why.

A confirmed __system architecture document__ covering how the six repos fit together, what talks to what, and where the real risk points are, so this knowledge exists somewhere other than in code and whoever picks up maintenance next isn't starting from zero.

A __working, automated build-and-deploy pipeline__ for the backend and frontend, an actual asset you keep using after we're gone, not just a one-time fix. Replaces the manual copy-from-a-laptop process entirely.

A __credential and integration inventory__: what third-party services and keys actually exist in this system, and which ones got rotated and when. This doesn't exist anywhere today and is useful security hygiene going forward, independent of this specific engagement.

A __shareable remediation summary__, a clean, external-facing version of what was fixed, distinct from the internal itemized list, meant for Residence Billing or anyone evaluating Ubility's security posture as part of the merger conversation.


---


## 


## Terms



* Delivered no later than __September 7__ assuming a prompt start, fixed scope as outlined above.
* Invoiced in three parts, one at the completion of each phase.
* Any scope discovered mid-engagement that falls outside this list (for example, a dependency found to rely on the current shared key in a way not visible from the repos alone) will be flagged before any additional work is started, not billed after the fact.
* Ongoing maintenance and feature development are a separate conversation, to be had once this work is complete.
* The timeline assumes IAM access, database access, and a working deploy path (items 1/2) are confirmed during Phase 1. Root-level AWS access already exists on Ubility side, so this should be straightforward, but if it turns out to require a deeper AWS Support case, the timeline will need to be revisited.
* If we end up needing to restore from a backup into a new RDS instance rather than working against the existing one, that's real additional scope beyond a credential rotation, provisioning, restoring the data, reconfiguring every connection string, and cutover testing. Daily backups already existing makes this a realistic fallback rather than a blocker, but it's not included in the price above and would be scoped and quoted separately if it's needed.
* Timely credential rotation on the Residence Billing-contracted services (item 4) depends on their contact being looped in promptly, any delays there push out Phase 2.
* This timeline depends on Client making Mike Bowers and the rest of the team promptly available for whatever account and credential access comes up along the way. Delays getting access from them push out the timeline the same way delays from AWS or Residence Billing would.
* This engagement is based on the six repos reviewed plus what we learn once we have live access. If another consumer of the backend API exists that we haven't been told about, the authentication change in item 7 could affect it unexpectedly. We’ve heard confirmation from the team in preliminary discussions, but can't be responsible for integrations we were never made aware of if there is a surprise later on.
* The original review, and our verification of it, was based on static code, history review and a product demo, not a live walkthrough of every production component. Additional findings may surface once we have live access that weren't visible in the repos alone, that's expected, not a sign of scope creep on our part.
* Where our fixes touch payment-related flows (item 9), we're correcting the access-token pattern around them, not expanding into payment processing itself or taking on any additional compliance scope.
* Any customer-facing communication about maintenance windows or possible service interruption during a deploy is Client's responsibility, not ours.


---


## 


## Price


<table>
  <tr>
   <td><strong>Phase</strong>
   </td>
   <td><strong>Description</strong>
   </td>
   <td><strong>Price</strong>
   </td>
  </tr>
  <tr>
   <td>Phase 1
   </td>
   <td><strong>Access & discovery</strong>: Setup infrastructure access, audit, and build a deployment pipeline with CI/CD.
   </td>
   <td>$2,500
   </td>
  </tr>
  <tr>
   <td>Phase 2
   </td>
   <td><strong>Stop the bleeding</strong>: Rotate compromised credentials, secure investor site financial data, and gate insecure backend services.
   </td>
   <td>$4,500
   </td>
  </tr>
  <tr>
   <td>Phase 3
   </td>
   <td><strong>Close the confirmed holes</strong>: Implement robust per-request authentication, URL validation, secrets management, git history remediation, and system hardening.
   </td>
   <td>$19,000
   </td>
  </tr>
  <tr>
   <td><strong>Total</strong>
   </td>
   <td>
   </td>
   <td><strong>$26,000</strong>
   </td>
  </tr>
</table>



## Legal Terms

__Limitation of liability. __Our total liability under this agreement is capped at the total fees paid, except for damages arising from gross negligence, willful misconduct, or a breach of the Confidentiality and data handling provisions below, which are not subject to this cap. Neither party is liable to the other for indirect, incidental, or consequential damages, including lost revenue, lost data, or business interruption.

__No warranty on the pre-existing system.__ This engagement fixes the specific items listed above. It is not a certification that the platform is otherwise free of defects or vulnerabilities, and we are not responsible for pre-existing issues in the system that fall outside that list.

__Assumption of risk: no staging environment.__ Client acknowledges that changes will be made against production with no staging environment available. We will take a database and server snapshot before each deploy as a mitigation, but this is not a guarantee against downtime or data loss from causes outside our control.

__Change orders.__ Any work outside the items listed above requires written approval (email is sufficient) of the added scope and price before we start it. We will not bill for out-of-scope work performed without that approval.

__Payment.__ Invoices are due within 15 days of receipt. Late payment may result in interest charges and suspension of work. Final deliverables may be withheld until payment is received in full.

__Termination.__ Either party may terminate for convenience with 7 days' written notice, or immediately for material breach (including non-payment). Fees for completed phases are non-refundable. A phase terminated mid-way is billed for work completed to that point.

__Assignment__. Neither party may assign this Agreement without the other's written consent, except that Client may assign it to a successor entity in connection with a merger, acquisition, or sale of substantially all assets, provided the successor assumes all obligations under this Agreement in writing.

__Delays outside our control.__ Timelines depend on timely access and cooperation from Client, AWS, and Residence Billing (for the credential rotations they control). Delays caused by any of these parties extend the timeline accordingly and are not a breach of this agreement.

__Confidentiality and data handling.__ Both parties will keep the other's confidential information confidential. We will not retain copies of credentials or secrets beyond what's operationally necessary to complete this engagement, and will follow reasonable security practices in handling any production data or access we're given.

__Client responsibility for provided access.__ Client is responsible for the legitimacy and scope of any credentials, accounts, or system access granted to us, and indemnifies us against claims arising from our good-faith use of that access.

__Work product.__ Deliverables produced under this agreement become Client's property upon full payment. We retain rights to our own general tools, methods, and know-how used in producing them.

__Independent contractor.__ We perform this work as independent contractors, not employees, and may involve additional personnel or subcontractors in delivering it.

__Governing law.__ This agreement is governed by the laws of the state of Utah. Disputes will be addressed through good-faith negotiation before either party pursues formal legal action.

__Entire agreement__. This Agreement, together with the Scope of Work above, is the entire agreement between the parties regarding this engagement and supersedes any prior discussions or understandings on the subject. If any provision of this Agreement is found unenforceable, the remaining provisions remain in full effect. This Agreement may only be amended by written agreement signed by both parties.


---


## Signatures

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date(s) set forth below.


<table>
  <tr>
   <td>KEYSTONE SYSTEMS LLC
   </td>
   <td>UBILITY LLC
   </td>
  </tr>
  <tr>
   <td><strong>By:</strong> 
   </td>
   <td><strong>By:</strong> 
   </td>
  </tr>
  <tr>
   <td><strong>Name:</strong> 
   </td>
   <td><strong>Name:</strong> 
   </td>
  </tr>
  <tr>
   <td><strong>Title:</strong> 
   </td>
   <td><strong>Title:</strong> 
   </td>
  </tr>
  <tr>
   <td><strong>Date:</strong> 
   </td>
   <td><strong>Date:</strong> 
   </td>
  </tr>
</table>