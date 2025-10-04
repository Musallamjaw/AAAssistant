import { useEffect, useState } from "react";

export default function PickaxeRunner() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://studio.pickaxe.co/api/embed/bundle.js";
    script.defer = true;
    script.onload = () => {
      console.log("Pickaxe embed loaded successfully");
      setIsLoading(false);
    };
    script.onerror = () => {
      console.error("Failed to load Pickaxe embed");
      setError("Failed to load Pickaxe embed");
      setIsLoading(false);
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    // Poll for pending jobs every 5 seconds
    const pollJobs = async () => {
      try {
        const response = await fetch("/api/pickaxe/jobs");
        if (!response.ok) {
          console.error("Failed to fetch pending jobs");
          return;
        }

        const jobs = await response.json();
        if (jobs.length === 0) return;

        // Process the first pending job
        const job = jobs[0];
        console.log("Processing Pickaxe job:", job);

        // Try to interact with Pickaxe embed
        // This will need to be customized based on how Pickaxe's embed actually works
        // For now, we'll log the attempt
        try {
          // Wait for Pickaxe widget to be ready
          await new Promise(resolve => setTimeout(resolve, 2000));

          // The actual interaction will depend on Pickaxe's widget API
          // We'll need to inspect the widget to find how to programmatically send messages
          console.log("Would send to Pickaxe:", job.question);

          // For now, send a placeholder response back
          // This will be replaced with actual Pickaxe response extraction
          const pickaxeResponse = "Pickaxe worker is running and receiving jobs. Widget interaction needs to be implemented based on Pickaxe's API.";

          // Submit the response back to the backend
          await fetch(`/api/pickaxe/jobs/${job.id}/response`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ response: pickaxeResponse }),
          });

          console.log("Pickaxe response submitted successfully");
        } catch (error) {
          console.error("Error processing Pickaxe job:", error);
        }
      } catch (error) {
        console.error("Error polling for jobs:", error);
      }
    };

    // Start polling after embed loads
    if (!isLoading && !error) {
      const interval = setInterval(pollJobs, 5000);
      // Also run once immediately
      pollJobs();

      return () => clearInterval(interval);
    }
  }, [isLoading, error]);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Pickaxe Worker (Hidden Page)</h1>
      <p>This page runs in the background to process Pickaxe jobs.</p>
      
      {isLoading && <p>Loading Pickaxe embed...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {!isLoading && !error && <p style={{ color: "green" }}>Pickaxe worker is running</p>}

      <div id="deployment-db3907fd-d283-4eb4-b96b-0a777b753af5"></div>
    </div>
  );
}
