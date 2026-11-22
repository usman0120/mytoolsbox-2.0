// Starter Mermaid diagrams for the Code tab.

export const MERMAID_EXAMPLES: { id: string; name: string; code: string }[] = [
  {
    id: "flowchart",
    name: "Flowchart",
    code: `flowchart TD
    A[Order received] --> B{In stock?}
    B -- Yes --> C[Pack items]
    B -- No --> D[Notify customer]
    C --> E[Ship order]
    D --> F[Offer refund or wait]
    E --> G([Done])`,
  },
  {
    id: "sequence",
    name: "Sequence",
    code: `sequenceDiagram
    actor User
    participant App
    participant Server
    User->>App: Tap "Sign in"
    App->>Server: Send email and password
    Server-->>App: Session token
    App-->>User: Show dashboard`,
  },
  {
    id: "class",
    name: "Class",
    code: `classDiagram
    class Customer {
      +String name
      +String email
      +placeOrder()
    }
    class Order {
      +int id
      +Date created
      +total()
    }
    Customer "1" --> "*" Order : places`,
  },
  {
    id: "er",
    name: "Entity relationship",
    code: `erDiagram
    STUDENT ||--o{ ENROLLMENT : has
    COURSE ||--o{ ENROLLMENT : includes
    STUDENT {
      int id
      string name
    }
    COURSE {
      int id
      string title
    }`,
  },
  {
    id: "state",
    name: "State",
    code: `stateDiagram-v2
    [*] --> Draft
    Draft --> Review : submit
    Review --> Draft : changes requested
    Review --> Published : approve
    Published --> [*]`,
  },
  {
    id: "gantt",
    name: "Gantt",
    code: `gantt
    title Website launch
    dateFormat YYYY-MM-DD
    section Plan
    Research      :a1, 2026-01-05, 7d
    Wireframes    :a2, after a1, 5d
    section Build
    Frontend      :b1, after a2, 14d
    Content       :b2, after a2, 10d
    section Launch
    Testing       :c1, after b1, 5d
    Go live       :milestone, after c1, 0d`,
  },
  {
    id: "mindmap",
    name: "Mind map",
    code: `mindmap
  root((Healthy habits))
    Sleep
      Same wake time
      Dark room
    Food
      More vegetables
      Less sugar
    Movement
      Daily walk
      Stretching`,
  },
  {
    id: "pie",
    name: "Pie chart",
    code: `pie title Monthly budget
    "Rent" : 45
    "Food" : 20
    "Transport" : 10
    "Savings" : 15
    "Other" : 10`,
  },
  {
    id: "timeline",
    name: "Timeline",
    code: `timeline
    title Project history
    2024 : Idea : First prototype
    2025 : Beta launch : 1,000 users
    2026 : Public launch`,
  },
];

/** Strips code fences and prose an AI model may add around Mermaid source. */
export function extractMermaid(text: string): string {
  const fenced = /```(?:mermaid)?\s*\n([\s\S]*?)```/i.exec(text);
  const body = (fenced ? fenced[1] : text).trim();
  const start = body.search(/^(flowchart|graph|sequenceDiagram|classDiagram|erDiagram|stateDiagram(-v2)?|gantt|mindmap|pie|timeline|journey|gitGraph|quadrantChart)\b/m);
  return start > 0 ? body.slice(start).trim() : body;
}
