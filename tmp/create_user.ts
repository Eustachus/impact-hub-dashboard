import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://acchqabawvlbggjysmix.supabase.co",
  "sb_publishable_RxzovbYYvkjEyMDDcO_QXA_SLxKPZtW"
);

async function createUser() {
  const { data, error } = await supabase.auth.signUp({
    email: "romance@focus.com",
    password: "QAZwsxEDC@123",
    options: {
      data: {
        full_name: "Romance",
      },
    },
  });

  if (error) {
    console.error("Error creating user:", error.message);
  } else {
    console.log("User created successfully:", data.user?.id);
  }
}

createUser();
