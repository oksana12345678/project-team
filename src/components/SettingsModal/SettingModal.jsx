import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { closeModal } from "../../redux/modalWindow/slice";
import { selectIsSettingModalOpen } from "../../redux/modalWindow/selectors";
import { selectUserEmail } from "../../redux/auth/selectors";
import { updateAvatar, updateUser } from "../../redux/auth/operations";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import showToast from "../showToast";
import { useToggle } from "../../hooks/useToggle";
import ModalWrapper from "../common/ModalWrapper/ModalWrapper";
import FormTitle from "./FormTitle/FormTitle";
import GenderIdentityGroup from "./GenderIdentityGroup";
import PhotoGroup from "./PhotoGroup/PhotoGroup";
import NameGroup from "./NameGroup";
import EmailGroup from "./EmailGroup";
import OldPasswordGroup from "./OldPasswordGroup";
import NewPasswordGroup from "./NewPasswordGroup";
import RepeatPasswordGroup from "./RepeatPasswordGroup";
import css from "./SettingModal.module.css";

const SettingModal = () => {
  const isModalOpen = useSelector(selectIsSettingModalOpen);
  const user = useSelector(selectUserEmail);
  const dispatch = useDispatch();

  const initialValues = {
    email: user.email || "",
    name: user.name || "",
    gender: user.gender,
    avatar: user.avatar || "",
    outdatedPassword: "",
    password: "",
    repeatPassword: "",
  };

  let patchedData = {};

  const userInfoValidationSchema = Yup.object({
    name: Yup.string().min(3, "Too short").max(32, "Too long"),
    email: Yup.string().email("Invalid email address"),
    outdatedPassword: Yup.string().min(8, "Too short").max(64, "Too long"),
    password: Yup.string().min(8, "Too short").max(64, "Too long"),
    repeatPassword: Yup.string().oneOf(
      [Yup.ref("password")],
      "Passwords must match"
    ),
  }).test("passwords-check", null, function (values) {
    const { outdatedPassword, password, repeatPassword } = values;

    const oneIsFilled = outdatedPassword || password || repeatPassword;
    const allAreFilled = outdatedPassword && password && repeatPassword;

    if (oneIsFilled && !allAreFilled) {
      if (!outdatedPassword) {
        return this.createError({
          path: "outdatedPassword",
          message: "All passwords should be filled",
        });
      }
      if (!password) {
        return this.createError({
          path: "password",
          message: "All passwords should be filled",
        });
      }
      if (!repeatPassword) {
        return this.createError({
          path: "repeatPassword",
          message: "All passwords should be filled",
        });
      }
    }
    return true;
  });

  const [state, toggle] = useToggle();
  const [isSubmitBlocked, setIsSubmitBlocked] = useState(false);

  function areEqualWithNull(values, user) {
    for (let key in values) {
      const formValue = values[key];
      const userValue = user[key];
      if (formValue !== (userValue ?? "")) {
        patchedData[key] = formValue;
      }
    }
    return patchedData;
  }
  const onSubmit = (values) => {
    setIsSubmitBlocked(true);
    setTimeout(() => {
      setIsSubmitBlocked(false);
    }, 3000);
    const { password, outdatedPassword, repeatPassword } = values;
    delete values["avatar"];
    patchedData = areEqualWithNull(values, user);

    if (Object.keys(patchedData).length == 0) {
      showToast("You have not made any changes.", "error");
    } else {
      if (outdatedPassword != "" || password != "" || repeatPassword != "") {
        if (outdatedPassword == password) {
          showToast(
            "New password cannot be the same as the old password.",
            "error"
          );
        } else if (
          outdatedPassword == "" ||
          password == "" ||
          repeatPassword == ""
        ) {
          showToast("Fill in all fields with passwords.", "error");
        } else {
          const keysForDelete = [
            "outdatedPassword",
            "password",
            "repeatPassword",
          ];
          keysForDelete.forEach((key) => {
            delete patchedData[key];
          });
          dispatch(
            updateUser({
              ...patchedData,
              password: outdatedPassword,
              newPassword: repeatPassword,
            })
          )
            .unwrap()
            .then(() => {
              showToast("Successfully changed information.", "success");
            })
            .catch((err) => {
              if (err == "Request failed with status code 401")
                showToast("Incorrect outdated password", "error");
              else showToast("Error, try later!", "error");
            });
        }
      } else {
        dispatch(updateUser(patchedData))
          .unwrap()
          .then(() => {
            showToast("Successfully changed information.", "success");
          })
          .catch(() => showToast("Error, try later!", "error"));
      }
    }

    patchedData = {};
  };

  const handleAvatarChange = (e) => {
    setIsSubmitBlocked(true);
    setTimeout(() => {
      setIsSubmitBlocked(false);
    }, 3000);
    const file = e.target.files[0];
    if (file) {
      dispatch(updateAvatar({ avatar: file }))
        .unwrap()
        .then(() => {
          showToast("Avatar changed!", "success");
        })
        .catch(() => {
          showToast("Error, try later!", "error");
        });
    }
  };

  const customStyles = {
    content: {
      paddingTop: "32px",
      paddingBottom:"32px"
    },
  };

  return (
    <ModalWrapper
      modalIsOpen={isModalOpen}
      closeModal={() => dispatch(closeModal())}
      customStyles={customStyles}
      buttonClassSettings
    >
      <FormTitle />
      <Formik
        initialValues={initialValues}
        validationSchema={userInfoValidationSchema}
        onSubmit={onSubmit}
      >
        {({ errors, touched }) => (
          <Form className={css["form-container"]} autoComplete="off">
            <PhotoGroup
              avatar={user.avatar}
              isSubmitBlocked={isSubmitBlocked}
              handleAvatarChange={handleAvatarChange}
            />
            <div className={css["desktop-flex"]}>
              <div className={css["desktop-left"]}>
                <GenderIdentityGroup />
                <NameGroup isError={errors.name} isTouched={touched.name} />
                <EmailGroup isError={errors.email} isTouched={touched.email} />
              </div>
              <div className={css["desktop-right"]}>
                <h3 className={css.subtitle}>Password</h3>
                <div className={css["password-group"]}>
                  <OldPasswordGroup
                    isHiddenPassword={state.oldPassword}
                    toggle={toggle}
                    isError={errors.outdatedPassword}
                    isTouched={touched.outdatedPassword}
                  />
                  <NewPasswordGroup
                    isHiddenPassword={state.password}
                    toggle={toggle}
                    isError={errors.password}
                    isTouched={touched.password}
                  />
                  <RepeatPasswordGroup
                    isHiddenPassword={state.repeatPassword}
                    toggle={toggle}
                    isError={errors.repeatPassword}
                    isTouched={touched.repeatPassword}
                  />
                </div>
              </div>
            </div>
            <div className={css["button-container"]}>
                <button
                  className={css["submit-button"]}
                  type="submit"
                  disabled={isSubmitBlocked}
                >
                  Save
                </button>
            </div>
          </Form>
        )}
      </Formik>
    </ModalWrapper>
  );
};

export default SettingModal;
