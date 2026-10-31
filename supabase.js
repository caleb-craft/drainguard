
const SUPABASE_URL = "https://stutslxuvvqfrewcgxfn.supabase.co";
const SUPABASE_KEY = "sb_publishable_EI-z3KROJDC61EqYwgaVwQ_A-vL8683";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

async function loadPoints() {
  const { data, error } = await supabaseClient
    .from("bin_points")
    .select("points")
    .eq("id", 1)
    .single();

  if (error) {
    console.error("Could not load points:", error.message);
    return;
  }

  const pointsDisplay = document.getElementById("points");

  if (pointsDisplay) {
    pointsDisplay.innerHTML = `${data.points} <span>points</span>`;
  }
}

async function initializeDashboard() {
  const { data, error } = await supabaseClient.auth.getSession();

  if (error || !data.session) {
    window.location.replace("signin.html");
    return;
  }

  const welcomeName = document.getElementById("welcome-name");
  if (welcomeName) {
    welcomeName.textContent =
      data.session.user.user_metadata.full_name || data.session.user.email;
  }

  await loadPoints();
}

if (document.getElementById("points")) {
  initializeDashboard();

  document.getElementById("signOutButton")?.addEventListener("click", async () => {
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
      console.error("Could not sign out:", error.message);
      return;
    }
    window.location.replace("signin.html");
  });
}
