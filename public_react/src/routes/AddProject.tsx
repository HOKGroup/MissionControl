import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { apiHooks } from "api/api";
import Page from "components/Page";
import { useCallback } from "react";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import Select from "react-select";

interface FormInputs {
  projectNumber: string;
  projectName: string;
  office: {
    value: string;
    label: string;
  };
  street1?: string;
  street2?: string;
  state: {
    value: string;
    label: string;
  };
  zipCode?: string;
  country?: string;
}

const AddProject: React.FC = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, touchedFields, isValid, isDirty }
  } = useForm<FormInputs>({
    mode: "all"
  });

  const {
    data: settingsData,
    isLoading: settingsIsLoading,
    error: _settingsError
  } = apiHooks.useGetSettings();

  const { mutate } = apiHooks.useAddProject();

  const projectName = watch("projectName");
  const projectNumber = watch("projectNumber");

  const handleCancel = useCallback(() => navigate("/projects"), [navigate]);

  const onSubmit = useCallback(
    (data: FormInputs) => {
      mutate({
        number: data.projectNumber,
        name: data.projectName,
        office: data.office.value,
        address: {
          street1: data.street1,
          street2: data.street2,
          state: data.state.value,
          zipCode: data.zipCode,
          country: data.country
        }
      });
    },
    [mutate]
  );

  const pageTitle =
    projectName || projectNumber
      ? [projectName, projectNumber].join(" ").trim()
      : "New Project";

  return (
    <Page title={pageTitle}>
      <Row>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <Card.Header>
              <Card.Title>Project Info</Card.Title>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-4">
                <Form.Label>
                  Project Number
                  {touchedFields.projectNumber && !errors.projectNumber && (
                    <FontAwesomeIcon
                      icon="check"
                      size="sm"
                      className="text-success ps-1"
                    />
                  )}
                  {(!touchedFields.projectNumber || errors.projectNumber) && (
                    <FontAwesomeIcon
                      icon="asterisk"
                      size="sm"
                      className="text-danger ps-1"
                    />
                  )}
                </Form.Label>
                <Form.Control
                  isInvalid={!!errors.projectNumber}
                  {...register("projectNumber", { required: true })}
                />
                {errors.projectNumber?.type === "required" && (
                  <p className="text-danger pt-1">
                    (*) Project Number is required.
                  </p>
                )}
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label>
                  Project Name
                  {touchedFields.projectName && !errors.projectName && (
                    <FontAwesomeIcon
                      icon="check"
                      size="sm"
                      className="text-success ps-1"
                    />
                  )}
                  {(!touchedFields.projectName || errors.projectName) && (
                    <FontAwesomeIcon
                      icon="asterisk"
                      size="sm"
                      className="text-danger ps-1"
                    />
                  )}
                </Form.Label>
                <Form.Control
                  type="text"
                  isInvalid={!!errors.projectName}
                  {...register("projectName", {
                    required: true,
                    maxLength: 35
                  })}
                />
                {errors.projectName?.type === "required" && (
                  <p className="text-danger pt-1">
                    (*) Project Name is required.
                  </p>
                )}
                {errors.projectName?.type === "maxLength" && (
                  <p className="text-danger pt-1">
                    (*) Project Name is too long.
                  </p>
                )}
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>
                  Office
                  {touchedFields.office && !errors.office && (
                    <FontAwesomeIcon
                      icon="check"
                      size="sm"
                      className="text-success ps-1"
                    />
                  )}
                  {(!touchedFields.office || errors.office) && (
                    <FontAwesomeIcon
                      icon="asterisk"
                      size="sm"
                      className="text-danger ps-1"
                    />
                  )}
                </Form.Label>
                <Controller
                  name="office"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      isMulti={false}
                      isSearchable={true}
                      isLoading={settingsIsLoading}
                      isDisabled={!settingsData}
                      options={settingsData?.offices.map((office) => ({
                        value: office.code[0],
                        label: office.name
                      }))}
                    />
                  )}
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Street Address</Form.Label>
                <Form.Control
                  placeholder="Street address, P.O. box, company name"
                  type="text"
                  isInvalid={!!errors.street1}
                  {...register("street1")}
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Street Address2</Form.Label>
                <Form.Control
                  placeholder="Apartment, suite, unit, building, floor, etc."
                  type="text"
                  isInvalid={!!errors.street2}
                  {...register("street2")}
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>State</Form.Label>
                <Controller
                  name="state"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      isSearchable={true}
                      isLoading={settingsIsLoading}
                      isDisabled={!settingsData}
                      options={settingsData?.states.map((state) => ({
                        value: state,
                        label: state
                      }))}
                    />
                  )}
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Zip Code</Form.Label>
                <Form.Control
                  type="text"
                  isInvalid={!!errors.zipCode}
                  {...register("zipCode")}
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Country</Form.Label>
                <Form.Control
                  type="text"
                  isInvalid={!!errors.country}
                  {...register("country")}
                />
              </Form.Group>

              <div
                className="d-flex justify-content-end"
                style={{
                  cursor: !isValid || !isDirty ? "not-allowed" : "pointer"
                }}
              >
                <Button
                  variant="secondary"
                  className="me-2"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button
                  disabled={!isValid || !isDirty}
                  type="submit"
                  variant="primary"
                >
                  <FontAwesomeIcon icon="plus" />
                  Add Project
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Form>
      </Row>
    </Page>
  );
};

export default AddProject;
