# Frontend file templates

Copy and adapt when scaffolding a new feature. Replace `projects` / `Projects` with your domain.

---

## `useApi` patterns (reference)

Wrapper: `app/composables/useApi.ts` — `useFetch` + `baseURL` + Bearer header + 401 redirect.

| Pattern                    | Options                                              | When                       |
| -------------------------- | ---------------------------------------------------- | -------------------------- |
| **GET list**               | `credentials: 'include'` (default `immediate: true`) | Page load / SSR            |
| **POST/PATCH/DELETE**      | `immediate: false`, `body: ref`, `method`            | Form submit → `execute()`  |
| **Refresh after mutation** | `refresh()` on the GET `useApi` instance             | After create/update/delete |

Always pass **`credentials: 'include'`** for cookie-based better-auth sessions.

---

## `app/composables/services/useCompanies.ts`

```ts
import { useApi } from "@/composables/useApi";

type Company = { id: string; name: string; role: string };

type CompaniesListResponse = {
  success: boolean;
  data?: Company[];
  error?: { message?: string };
};

export const useCompanies = () => {
  const activeCompanyId = useState<string | null>(
    "active-company-id",
    () => null,
  );

  const {
    data: listData,
    pending: listPending,
    refresh: refreshCompanies,
  } = useApi<CompaniesListResponse>("/companies", {
    credentials: "include",
  });

  const companies = computed(() => listData.value?.data ?? []);

  watch(
    companies,
    (list) => {
      if (!activeCompanyId.value && list.length > 0) {
        activeCompanyId.value = list[0]!.id;
      }
    },
    { immediate: true },
  );

  return {
    activeCompanyId,
    companies,
    listPending,
    refreshCompanies,
  };
};
```

---

## `app/composables/services/useProjects.ts` (company-scoped)

```ts
import { useApi } from "@/composables/useApi";

export const useProjects = () => {
  const { activeCompanyId } = useCompanies();

  const createProject = async (body: TYPE GET FROM GENERATED SCHEMA) => {
    if (!activeCompanyId.value) {
      throw new Error("No active company");
    }
    return await useApi<ProjectCreateResponse>(createUrl, {
      method: "POST",
      body: body,
    });
  };

  return {
    createProject,
  };
};
```

> `useApi` accepts `ComputedRef` URLs (via `MaybeRefOrGetter`) so requests re-run when the user switches company.

---

## `app/validations/projects.ts`

```ts
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";

export const getCreateProjectValidation = () => {
  const { t } = useI18n();

  return z.object({
    name: z
      .string(t("validation.required"))
      .min(2, { message: t("validation.name_min", { min: 2 }) }),
    location: z.string().optional(),
  });
};

export type createProjectSchema = z.infer<
  ReturnType<typeof getCreateProjectValidation>
>;

export const toTypeCreateProjectValidation = () =>
  toTypedSchema(getCreateProjectValidation());
```

---

## `i18n/locales/en.json` (snippet)

```json
"projects": {
  "title": "Projects",
  "subtitle": "Manage your construction projects",
  "name": "Project name",
  "location": "Location",
  "create": "Create project",
  "empty": "No projects yet. Create your first one.",
  "createSuccess": "Project created",
  "loadError": "Failed to load projects"
}
```

---

## `app/components/use/projects/ProjectCreateForm.vue`

```vue
<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import InputError from "@/components/ui/input/error.vue";
import { toTypeCreateProjectValidation } from "@/validations/projects";
import { useProjects } from "@/composables/services/useProjects";
import { toast } from "vue-sonner";

const emit = defineEmits<{ created: [] }>();

const { t } = useI18n();
const { createProject } = useProjects();
const validationSchema = toTypeCreateProjectValidation();
const isSubmitting = ref(false);

const onSubmit = async (values: { name: string; location?: string }) => {
  if (isSubmitting.value) return;
  isSubmitting.value = true;
  try {
    const result = await createProject(values);
    if (result.error) {
      throw new Error(result.error?.message ?? t("errors.generic"));
    }
    toast.success(t("projects.createSuccess"));
    emit("created");
  } catch (error) {
    toast.error(useErrorMessage(error).message);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <Form :validation-schema="validationSchema" @submit="onSubmit">
    <div class="space-y-4">
      <FormField v-slot="{ componentField }" name="name">
        <Label>{{ t("projects.name") }}</Label>
        <Input v-bind="componentField" />
        <InputError name="name" />
      </FormField>
      <FormField v-slot="{ componentField }" name="location">
        <Label>{{ t("projects.location") }}</Label>
        <Input v-bind="componentField" />
        <InputError name="location" />
      </FormField>
      <Button type="submit" :disabled="isSubmitting">
        {{ t("projects.create") }}
      </Button>
    </div>
  </Form>
</template>
```

---

## `app/pages/app/projects/index.vue`

```vue
<script setup lang="ts">
import ProjectCreateForm from "@/components/use/projects/ProjectCreateForm.vue";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProjects } from "@/composables/services/useProjects";
import { toast } from "vue-sonner";

definePageMeta({
  middleware: "auth",
  name: "app-projects",
  breadcrumb: "Projects",
});

const { t } = useI18n();
const { listData, listPending, refreshList } = useProjects();

const projects = computed(() => listData.value?.data ?? []);
const isLoading = listPending;

async function load() {
  try {
    await refreshList();
    if (listData.value && !listData.value.success) {
      throw new Error(listData.value.error?.message ?? t("projects.loadError"));
    }
  } catch (error) {
    toast.error(useErrorMessage(error).message);
  }
}
</script>

<template>
  <div class="space-y-6 p-4">
    <div>
      <h1 class="text-2xl font-semibold">{{ t("projects.title") }}</h1>
      <p class="text-muted-foreground">{{ t("projects.subtitle") }}</p>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>{{ t("projects.create") }}</CardTitle>
      </CardHeader>
      <CardContent>
        <ProjectCreateForm @created="load" />
      </CardContent>
    </Card>

    <p v-if="isLoading" class="text-muted-foreground">Loading…</p>
    <p v-else-if="projects.length === 0" class="text-muted-foreground">
      {{ t("projects.empty") }}
    </p>
    <ul v-else class="space-y-2">
      <li v-for="p in projects" :key="p.id" class="rounded-md border p-3">
        {{ p.name }}
        <span v-if="p.location" class="text-muted-foreground">
          — {{ p.location }}</span
        >
      </li>
    </ul>
  </div>
</template>
```

---

## Sidebar nav snippet

Add to the nav `items` array in `app/components/use/layout/AppSidebar.vue` or `NavMain.vue`:

```ts
{
  title: 'Projects',
  url: '/app/projects',
  icon: 'lucide:folder-kanban',
}
```

---

## Full-stack order

1. Backend: schema → migrate → route (see `backend-bun` skill)
2. Frontend: `pnpm types:api` → composable → page
3. Test signed-in flow at `http://localhost:3092`
