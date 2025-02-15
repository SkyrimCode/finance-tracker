import app from "../../firebase";
import { getDatabase, ref, get } from "firebase/database";

import { getAuth, onAuthStateChanged } from "firebase/auth";

export const fetchRowsData = (setRows, setIsLoading) => {
  const db = getDatabase(app);
  const auth = getAuth();
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const email = user.email?.replace(/\./g, "_");
      const dbRef = ref(db, `users/${email}`);
      const snapshot = await get(dbRef);

      if (snapshot.exists()) {
        const records = snapshot.val();
        const recordsArray = Object.keys(records).map((key) => ({
          id: key, // Unique Firebase key
          ...records[key], // Actual data
        }));

        setRows(recordsArray);
      }
    } else {
      console.log("Auth unsuccessful");
    }
    setIsLoading(false);
  });
};
