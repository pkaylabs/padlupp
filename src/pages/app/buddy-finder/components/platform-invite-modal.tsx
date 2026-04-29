import Button from "@/components/core/buttons";
import TextInput from "@/components/core/inputs";
import ButtonLoader from "@/components/loaders/button";
import { Modal } from "@/components/core/modal";
import { usePlatformInvite } from "../hooks/useBuddies";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  NAME_ALLOWED_PATTERN,
  NAME_MAX_LENGTH,
  sanitizeNameInput,
} from "@/utils/name-validation";

interface PlatformInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const validationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .max(NAME_MAX_LENGTH, `Name must be ${NAME_MAX_LENGTH} characters or less`)
    .matches(NAME_ALLOWED_PATTERN, "Only letters and spaces are allowed")
    .required("Required field"),
  email: Yup.string().email("Invalid email address").required("Required field"),
});

export const PlatformInviteModal = ({ isOpen, onClose }: PlatformInviteModalProps) => {
  const { mutate: sendInvite, isPending } = usePlatformInvite();

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
    },
    validationSchema,
    onSubmit: (values) => {
      sendInvite(
        {
          name: sanitizeNameInput(values.name).trim(),
          email: values.email.trim(),
        },
        {
          onSuccess: () => {
            formik.resetForm();
            onClose();
          },
        },
      );
    },
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton
      className="w-md top-1/2 -translate-y-1/2"
    >
      <div className="p-6 w-full">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-1">
          Invite Someone
        </h3>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-5">
          Send an invite for them to join the platform.
        </p>

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <TextInput
            id="name"
            label="Name"
            type="text"
            maxLength={NAME_MAX_LENGTH}
            values={formik.values}
            errors={formik.errors}
            touched={formik.touched}
            handleChange={(event) => {
              const sanitized = sanitizeNameInput(event.target.value).trimStart();
              formik.setFieldValue("name", sanitized);
            }}
            handleBlur={formik.handleBlur}
          />

          <TextInput
            id="email"
            label="Email"
            type="email"
            values={formik.values}
            errors={formik.errors}
            touched={formik.touched}
            handleChange={formik.handleChange}
            handleBlur={formik.handleBlur}
          />

          <Button type="submit" variant="primary" className="w-full" disabled={isPending}>
            {isPending ? <ButtonLoader title="Sending invite..." /> : "Send Invite"}
          </Button>
        </form>
      </div>
    </Modal>
  );
};
