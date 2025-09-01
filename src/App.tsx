import { supabase } from "./supabaseClient";
import { useEffect, useState } from "react";

function App() {
  const [page, setPage] = useState("home");
  const [hovered, setHovered] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  // Load Paystack script & check Supabase session
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    document.body.appendChild(script);

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const navBtn = (name: string) => ({
    marginRight: "10px",
    padding: "8px 16px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    backgroundColor: hovered === name ? "#4CAF50" : "#f0f0f0",
    color: hovered === name ? "#fff" : "#333",
    cursor: "pointer",
    transition: "0.3s",
  });

  const donateBtn = {
    padding: "10px 20px",
    backgroundColor: "#4CAF50",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  };

  // Paystack Donation Handler
  const handleDonate = () => {
    if (!(window as any).PaystackPop) {
      alert("Paystack script not loaded yet. Try again in a moment.");
      return;
    }
    const handler = (window as any).PaystackPop.setup({
      key: "pk_test_ed79ab5f0297f8abc85415cb4465182dfcb6fa45", // replace with your public key
      email: user?.email || "donor@example.com",
      amount: 1000 * 100,
      currency: "NGN",
      ref: "" + Math.floor(Math.random() * 1000000000 + 1),
      callback: function (response: any) {
        alert("Donation successful. Transaction ref: " + response.reference);
      },
      onClose: function () {
        alert("Transaction was not completed, window closed.");
      },
    });
    handler.openIframe();
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert("Logout failed: " + error.message);
    } else {
      setUser(null);
      setPage("home");
    }
  };

  // Login/Signup component
  const LoginSignup = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [isSignup, setIsSignup] = useState(true);

    const handleAuth = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        if (isSignup) {
          const {data:_data, error } = await supabase.auth.signUp({ email, password });
          if (error) setMessage("Signup failed: " + error.message);
          else setMessage("Signup successful! Check your email to confirm.");
        } else {
          const {data:_data, error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) setMessage("Login failed: " + error.message);
          else setMessage("Login successful!");
        }
      } catch (err) {
        setMessage("Unexpected error: " + err);
      }
    };

    return (
      <div>
        <h2>{isSignup ? "Sign Up" : "Login"}</h2>
        <form onSubmit={handleAuth}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ marginBottom: "10px", padding: "8px", width: "250px" }}
          />
          <br />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ marginBottom: "10px", padding: "8px", width: "250px" }}
          />
          <br />
          <button type="submit" style={donateBtn}>
            {isSignup ? "Sign Up" : "Login"}
          </button>
        </form>
        <p>{message}</p>
        <button
          style={{
            marginTop: "10px",
            background: "transparent",
            border: "none",
            color: "#4CAF50",
            cursor: "pointer",
          }}
          onClick={() => setIsSignup(!isSignup)}
        >
          {isSignup ? "Already have an account? Login" : "Don't have an account? Sign Up"}
        </button>
      </div>
    );
  };

  // Courses component
  const Courses = () => {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState<"all" | "free" | "premium">("all");

    useEffect(() => {
      const fetchCourses = async () => {
        const { data, error } = await supabase.from("courses").select("*");
        if (error) console.log("Error fetching courses:", error.message);
        setCourses(data || []);
        setLoading(false);
      };
      fetchCourses();
    }, []);

    if (loading) return <p>Loading courses...</p>;
    if (courses.length === 0) return <p>No courses available.</p>;

    const filteredCourses = courses.filter((course) => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter =
        filter === "all" ||
        (filter === "free" && !course.premium) ||
        (filter === "premium" && course.premium);
      return matchesSearch && matchesFilter;
    });

    return (
      <div>
        <div style={{ marginBottom: "15px" }}>
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: "8px", width: "200px", marginRight: "10px" }}
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            style={{ padding: "8px" }}
          >
            <option value="all">All</option>
            <option value="free">Free</option>
            <option value="premium">Premium</option>
          </select>
        </div>

        {filteredCourses.length === 0 ? (
          <p>No courses match your search/filter.</p>
        ) : (
          filteredCourses.map((course) => (
            <div
              key={course.id}
              style={{
                border: "1px solid #ccc",
                borderRadius: "10px",
                padding: "15px",
                marginBottom: "10px",
                backgroundColor: course.premium && !user ? "#f9f9f9" : "#fff",
              }}
            >
              <h3 style={{ margin: "0 0 5px 0", color: "#333" }}>
                {course.title}{" "}
                {course.premium && (
                  <span
                    style={{
                      backgroundColor: "#FFD700",
                      color: "#333",
                      padding: "2px 8px",
                      borderRadius: "5px",
                      fontSize: "12px",
                    }}
                  >
                    Premium
                  </span>
                )}
              </h3>
              <p style={{ margin: "0 0 5px 0", color: "#555" }}>
                {course.premium && !user
                  ? "Login to view full course description"
                  : course.description}
              </p>
            </div>
          ))
        )}
      </div>
    );
  };

  // Quiz / Study Buddy component
  const Quiz = () => {
    const [notes, setNotes] = useState("");
    const [cards, setCards] = useState<{ question: string; answer: string }[]>([]);

    const generateQuiz = () => {
      const sentences = notes.split(".").filter((s) => s.trim().length > 0);
      const generated = sentences.map((s, i) => ({
        question: `Question ${i + 1}: What is the main idea of "${s.trim().slice(0, 20)}..."?`,
        answer: s.trim(),
      }));
      setCards(generated);
    };

    return (
      <div>
        <h2>📝 AI Study Buddy (Mini Quiz)</h2>
        <textarea
          placeholder="Paste your study notes here..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={{ width: "100%", height: "100px", marginBottom: "10px" }}
        />
        <br />
        <button
          onClick={generateQuiz}
          style={{
            padding: "10px 20px",
            backgroundColor: "#4CAF50",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            marginBottom: "20px",
          }}
        >
          Generate Quiz
        </button>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>
          {cards.map((card, index) => (
            <div
              key={index}
              style={{
                width: "250px",
                height: "180px",
                border: "1px solid #ccc",
                borderRadius: "10px",
                perspective: "1000px",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  position: "relative",
                  transition: "transform 0.6s",
                  transformStyle: "preserve-3d",
                  cursor: "pointer",
                }}
                onClick={(e: any) => {
                  const current = e.currentTarget;
                  current.style.transform =
                    current.style.transform === "rotateY(180deg)"
                      ? "rotateY(0deg)"
                      : "rotateY(180deg)";
                }}
              >
                {/* Front */}
                <div
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    backfaceVisibility: "hidden",
                    backgroundColor: "#333",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    padding: "15px",
                    borderRadius: "10px",
                    overflowWrap: "break-word",
                  }}
                >
                  <p>{card.question}</p>
                </div>

                {/* Back */}
                <div
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                    backgroundColor: "#555",
                    color: "#FFD700",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    padding: "15px",
                    borderRadius: "10px",
                    overflowWrap: "break-word",
                  }}
                >
                  <p>{card.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>📚EduConnect: Quality Education (SDG 4)</h1>

      {/* Navigation */}
      <nav style={{ marginBottom: "20px" }}>
        <button
          onClick={() => setPage("home")}
          style={navBtn("home")}
          onMouseEnter={() => setHovered("home")}
          onMouseLeave={() => setHovered(null)}
        >
          🏠 Home
        </button>
        <button
          onClick={() => setPage("courses")}
          style={navBtn("courses")}
          onMouseEnter={() => setHovered("courses")}
          onMouseLeave={() => setHovered(null)}
        >
          📘 Courses
        </button>
        <button
          onClick={() => setPage("quiz")}
          style={navBtn("quiz")}
          onMouseEnter={() => setHovered("quiz")}
          onMouseLeave={() => setHovered(null)}
        >
          📝 Study Buddy
        </button>
        <button
          onClick={() => setPage("donate")}
          style={navBtn("donate")}
          onMouseEnter={() => setHovered("donate")}
          onMouseLeave={() => setHovered(null)}
        >
          💳 Donate
        </button>

        {!user && (
          <button
            onClick={() => setPage("login")}
            style={navBtn("login")}
            onMouseEnter={() => setHovered("login")}
            onMouseLeave={() => setHovered(null)}
          >
            🔑 Login / Signup
          </button>
        )}

        {user && (
          <>
            <span style={{ marginRight: "10px" }}>👤 {user.email}</span>
            <button
              onClick={handleLogout}
              style={navBtn("logout")}
              onMouseEnter={() => setHovered("logout")}
              onMouseLeave={() => setHovered(null)}
            >
              Logout
            </button>
          </>
        )}
      </nav>

      {/* Page Content */}
      {page === "home" && (
        <div>
          <h2>Welcome to EduConnect!🌍</h2>
          <p>
            Our mission is to make quality education accessible to everyone,
            learn new skills, grow your knowledge & support our cause.
          </p>
        </div>
      )}

      {page === "courses" && <Courses />}
      {page === "quiz" && <Quiz />}

      {page === "donate" && (
        <>
          <h2>💳 Support Our Mission</h2>
          <p>
            Help us reach more learners by supporting our platform.
            Your contribution makes a difference!
          </p>
          <button style={donateBtn} onClick={handleDonate}>
            Donate with Paystack
          </button>
        </>
      )}

      {page === "login" && <LoginSignup />}
    </div>
  );
}

export default App;
