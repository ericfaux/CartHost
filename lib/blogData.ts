export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  date: string;
  readTime: string;
  content: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "The Horror Story: I added a golf cart to my Airbnb and got sued",
    slug: "airbnb-golf-cart-liability-story",
    excerpt:
      "What started as a simple amenity upgrade turned into a $47,000 lawsuit. Here's how one Airbnb host learned the hard way about golf cart liability—and how you can avoid the same fate.",
    date: "2026-01-15",
    readTime: "8 min read",
    content: `
      <p>When Sarah added a golf cart to her beachside Airbnb in Florida, she thought it would be the perfect amenity to set her listing apart. Guests could cruise to the beach, grab groceries, and explore the neighborhood without needing a car.</p>

      <p>What she didn't anticipate was the phone call she'd receive three months later from an attorney representing her former guest.</p>

      <h2>The Incident</h2>

      <p>On a sunny Saturday afternoon, a guest's teenage son took the golf cart for a joyride. He lost control on a turn, flipped the cart, and suffered a broken collarbone. The family's medical bills exceeded $15,000, and they were coming after Sarah for damages.</p>

      <p>"I assumed my homeowner's insurance would cover it," Sarah told us. "I was wrong. They denied the claim because golf carts are classified as motorized vehicles."</p>

      <h2>The Lawsuit</h2>

      <p>The lawsuit alleged negligence on multiple fronts:</p>

      <ul>
        <li>Failure to provide adequate safety instructions</li>
        <li>No age restrictions or driver verification</li>
        <li>No signed liability waiver</li>
        <li>No documentation of the cart's condition before use</li>
      </ul>

      <p>After 18 months of legal battles and $12,000 in attorney fees, Sarah settled for $35,000—money that came directly from her personal savings.</p>

      <h2>What Sarah Wishes She'd Known</h2>

      <p>Looking back, Sarah identifies three critical mistakes:</p>

      <p><strong>1. No liability waiver:</strong> A signed waiver wouldn't have prevented the accident, but it would have significantly reduced her legal exposure and potentially deterred the lawsuit entirely.</p>

      <p><strong>2. No photo documentation:</strong> Without before-and-after photos, she couldn't prove the cart was in good condition when the guest arrived. The plaintiff's attorney argued the brakes were faulty—a claim Sarah couldn't disprove.</p>

      <p><strong>3. No driver verification:</strong> She had no record of who was authorized to operate the cart. The guest's booking was in an adult's name, but a minor was driving when the accident occurred.</p>

      <h2>The Lesson for Every Host</h2>

      <p>Golf carts are not covered by Airbnb's AirCover. They're not covered by standard homeowner's insurance. And they're increasingly being added to vacation rentals without proper liability protection.</p>

      <p>If you're offering a golf cart to guests, you need three things at minimum:</p>

      <ul>
        <li>A comprehensive liability waiver signed before each rental</li>
        <li>Photo documentation of the cart's condition</li>
        <li>Clear rules about who can operate the cart</li>
      </ul>

      <p>Sarah's story is unfortunately common. Don't let it become yours.</p>
    `,
  },
  {
    id: "2",
    title: "The Ultimate Guide to Insuring Golf Carts for Short-Term Rentals",
    slug: "golf-cart-rental-insurance-guide",
    excerpt:
      "Standard homeowner's policies don't cover golf carts. AirCover excludes motorized vehicles. Here's what insurance you actually need and how to get it.",
    date: "2026-01-10",
    readTime: "12 min read",
    content: `
      <p>If you're providing a golf cart to your Airbnb or VRBO guests, you're likely underinsured. Most hosts discover this the hard way—after an incident forces them to file a claim that gets denied.</p>

      <p>This guide breaks down exactly what insurance you need, what it costs, and how to get it.</p>

      <h2>Why Standard Insurance Doesn't Work</h2>

      <h3>Homeowner's Insurance</h3>

      <p>Most homeowner's policies explicitly exclude motorized vehicles from liability coverage. Golf carts, ATVs, and similar equipment are typically carved out in the policy language. Even if your golf cart never leaves your property, it's probably not covered.</p>

      <h3>Airbnb AirCover</h3>

      <p>Airbnb's AirCover program provides up to $3 million in liability protection for hosts—but not for motorized vehicles. The terms explicitly exclude "motor vehicles, aircraft, and watercraft."</p>

      <h3>VRBO Liability Insurance</h3>

      <p>Similarly, VRBO's liability protection excludes incidents involving motorized vehicles. The policy language is clear: golf carts are not covered.</p>

      <h2>Insurance Options for Golf Cart Owners</h2>

      <h3>Option 1: Golf Cart-Specific Policy</h3>

      <p>Several insurers offer standalone golf cart policies. These typically provide:</p>

      <ul>
        <li>Liability coverage: $100,000 to $300,000</li>
        <li>Property damage coverage for the cart itself</li>
        <li>Medical payments coverage</li>
        <li>Uninsured motorist coverage (if your cart is street-legal)</li>
      </ul>

      <p><strong>Cost:</strong> $75-200 per year for recreational use. Commercial or rental use policies cost more—typically $300-600 per year.</p>

      <h3>Option 2: Commercial General Liability (CGL)</h3>

      <p>If you operate multiple properties or have several carts, a CGL policy may make more sense. These policies cover your business operations broadly, including equipment you provide to guests.</p>

      <p><strong>Cost:</strong> $500-2,000 per year depending on coverage limits and number of properties.</p>

      <h3>Option 3: Umbrella Policy</h3>

      <p>An umbrella policy provides additional liability coverage above your primary policies. However, you'll still need underlying golf cart coverage for the umbrella to apply.</p>

      <h2>What to Look for in a Policy</h2>

      <p>When shopping for golf cart insurance, ensure the policy covers:</p>

      <ul>
        <li><strong>Rental or commercial use:</strong> Recreational policies may not cover guests</li>
        <li><strong>Multiple operators:</strong> The policy should cover any authorized driver</li>
        <li><strong>Property damage:</strong> Both to the cart and to third-party property</li>
        <li><strong>Medical payments:</strong> For injuries to operators and passengers</li>
      </ul>

      <h2>Recommended Insurers</h2>

      <p>Based on our research, these insurers offer golf cart policies suitable for short-term rental use:</p>

      <ul>
        <li>Progressive</li>
        <li>State Farm</li>
        <li>Foremost Insurance Group</li>
        <li>National General</li>
      </ul>

      <p>Contact each for quotes and ensure you disclose that the cart will be used by vacation rental guests.</p>

      <h2>Insurance Is Just Part of the Solution</h2>

      <p>Even with proper insurance, you should still implement liability waivers, photo documentation, and driver verification. Insurance helps cover costs after an incident—waivers and documentation help prevent incidents and protect you in litigation.</p>
    `,
  },
  {
    id: "3",
    title: "Printable Golf Cart Maintenance Log vs. Digital Logs",
    slug: "golf-cart-maintenance-log-guide",
    excerpt:
      "Should you track golf cart maintenance with paper or software? We compare both approaches and explain when each makes sense for vacation rental hosts.",
    date: "2026-01-05",
    readTime: "6 min read",
    content: `
      <p>Regular maintenance keeps your golf cart safe and reliable for guests. But how should you track that maintenance? The answer depends on how many carts you manage and how serious you are about documentation.</p>

      <h2>The Case for Paper Logs</h2>

      <p>A printable golf cart maintenance log is simple, free, and requires no technical setup. You can keep it in a binder at your property or with your cart's documentation.</p>

      <h3>Advantages of Paper Logs</h3>

      <ul>
        <li><strong>No cost:</strong> Print and go</li>
        <li><strong>No learning curve:</strong> Anyone can fill in a form</li>
        <li><strong>Physical record:</strong> Tangible documentation for inspections</li>
        <li><strong>No internet required:</strong> Works anywhere</li>
      </ul>

      <h3>Disadvantages of Paper Logs</h3>

      <ul>
        <li><strong>Can be lost or damaged:</strong> Water, fire, and misplacement happen</li>
        <li><strong>Hard to search:</strong> Finding specific records takes time</li>
        <li><strong>No reminders:</strong> You have to remember to check it</li>
        <li><strong>No photo support:</strong> Can't attach images to entries</li>
        <li><strong>Single location:</strong> Only accessible where the paper is stored</li>
      </ul>

      <h2>The Case for Digital Logs</h2>

      <p>Digital maintenance tracking offers automation, accessibility, and integration with other systems. For hosts with multiple carts or properties, the benefits often outweigh the costs.</p>

      <h3>Advantages of Digital Logs</h3>

      <ul>
        <li><strong>Cloud storage:</strong> Access from anywhere, never lose records</li>
        <li><strong>Automatic reminders:</strong> Get notified when maintenance is due</li>
        <li><strong>Photo attachments:</strong> Document condition with images</li>
        <li><strong>Searchable history:</strong> Find any record instantly</li>
        <li><strong>Reporting:</strong> See trends and costs over time</li>
        <li><strong>Integration:</strong> Connect with guest check-in workflows</li>
      </ul>

      <h3>Disadvantages of Digital Logs</h3>

      <ul>
        <li><strong>Cost:</strong> Most solutions require a subscription</li>
        <li><strong>Learning curve:</strong> Takes time to set up and learn</li>
        <li><strong>Internet required:</strong> Need connectivity to access</li>
      </ul>

      <h2>When to Use Each Approach</h2>

      <h3>Paper Makes Sense When:</h3>

      <ul>
        <li>You have one cart at one property</li>
        <li>You perform maintenance yourself</li>
        <li>You're not concerned about long-term record keeping</li>
        <li>Budget is a primary concern</li>
      </ul>

      <h3>Digital Makes Sense When:</h3>

      <ul>
        <li>You manage multiple carts or properties</li>
        <li>You want maintenance reminders</li>
        <li>You need to prove maintenance history (for liability or resale)</li>
        <li>You want to integrate with guest check-in workflows</li>
      </ul>

      <h2>Our Recommendation</h2>

      <p>For most vacation rental hosts with golf carts, we recommend starting with a simple digital solution. The benefits of automatic reminders and cloud storage outweigh the modest cost. And if you ever face a liability claim, having timestamped, searchable maintenance records could be invaluable.</p>

      <p>CartHost includes maintenance tracking as part of its golf cart management platform, along with guest waivers and inspection photos. It's designed specifically for vacation rental hosts who want to protect themselves while providing a great guest experience.</p>
    `,
  },
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export function getAllBlogPosts(): BlogPost[] {
  return blogPosts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}
