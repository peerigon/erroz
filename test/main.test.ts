import {basename} from "path";
import {defineError, CustomErrorClass, CustomError} from "../src/main";
import {JSendResponse, JSendStatus} from "../src/jSend";
import {collectSnapshotProps} from "./util/snapshot";

describe("defineError", () => {
    type MetaData = typeof baseMetaData;
    type InstanceKeys = Array<keyof CustomError>;
    type JsonKeys = Array<keyof JSendResponse>;
    const baseMetaData = {
        some: "meta-data",
    };
    const baseOptions = {
        name: "TestError",
        message: "There was an error",
    };
    const instanceKeysToSnapshot: InstanceKeys = [
        "name",
        "message",
        "code",
        "statusCode",
        "status",
        "data",
    ];
    const jsonKeysToSnapshot: JsonKeys = ["status", "code", "message", "data"];

    describe("when called with the minimum set of required arguments", () => {
        let TestError: CustomErrorClass<MetaData>;

        beforeEach(() => {
            TestError = defineError(baseOptions);
        });

        describe("the return value when called with new", () => {
            let error: CustomError<MetaData>;

            beforeEach(() => {
                error = new TestError(baseMetaData);
            });

            it("returns an instance of Error", () => {
                expect(error).toBeInstanceOf(Error);
            });

            describe("." + instanceKeysToSnapshot.join(", ."), () => {
                it("should match their snapshots", () => {
                    const propsToSnapshot = collectSnapshotProps(
                        error,
                        instanceKeysToSnapshot,
                    );

                    expect(propsToSnapshot).toMatchInlineSnapshot(`
Object {
  "code": "test-error",
  "data": Object {
    "some": "meta-data",
  },
  "message": "There was an error",
  "name": "TestError",
  "status": "error",
  "statusCode": 500,
}
`);
                });
            });

            describe(".stack", () => {
                it("does not contain the source location where the error has been created", () => {
                    // Using dynamic __filename here to make the test more robust in case the file names are changed
                    const filename = basename(__filename).replace(
                        /\.test\.ts$/,
                        ".ts",
                    );

                    expect(error.stack).not.toMatch(filename);
                });
            });

            describe("the return value of .toJSON()", () => {
                describe("." + jsonKeysToSnapshot.join(", ."), () => {
                    it("should match their snapshots", () => {
                        const propsToSnapshot = collectSnapshotProps(
                            error,
                            jsonKeysToSnapshot as InstanceKeys,
                        );

                        expect(propsToSnapshot).toMatchInlineSnapshot(`
Object {
  "code": "test-error",
  "data": Object {
    "some": "meta-data",
  },
  "message": "There was an error",
  "status": "error",
}
`);
                    });
                });
            });
        });
    });

    describe('when called with a function as "message"', () => {
        type MetaData = typeof metaData;
        const metaData = {
            ...baseMetaData,
            resource: "User",
            id: "123",
        };
        const options = {
            ...baseOptions,
            message: ({resource, id}: MetaData) =>
                `Resource ${resource} (${id}) already exists`,
        };
        let TestError: CustomErrorClass<MetaData>;

        beforeEach(() => {
            TestError = defineError(options);
        });

        describe("the return value when called with new", () => {
            let error: CustomError<MetaData>;

            beforeEach(() => {
                error = new TestError(metaData);
            });

            describe("." + instanceKeysToSnapshot.join(", ."), () => {
                it("should match their snapshots", () => {
                    const propsToSnapshot = collectSnapshotProps(
                        error,
                        instanceKeysToSnapshot,
                    );

                    expect(propsToSnapshot).toMatchInlineSnapshot(`
Object {
  "code": "test-error",
  "data": Object {
    "id": "123",
    "resource": "User",
    "some": "meta-data",
  },
  "message": "Resource User (123) already exists",
  "name": "TestError",
  "status": "error",
  "statusCode": 500,
}
`);
                });
            });

            describe("the return value of .toJSON()", () => {
                describe("." + jsonKeysToSnapshot.join(", ."), () => {
                    it("should match their snapshots", () => {
                        const propsToSnapshot = collectSnapshotProps(
                            error,
                            jsonKeysToSnapshot as InstanceKeys,
                        );

                        expect(propsToSnapshot).toMatchInlineSnapshot(`
Object {
  "code": "test-error",
  "data": Object {
    "id": "123",
    "resource": "User",
    "some": "meta-data",
  },
  "message": "Resource User (123) already exists",
  "status": "error",
}
`);
                    });
                });
            });
        });
    });

    Object.entries({
        200: "success",
        299: "success",
        400: "fail",
        499: "fail",
        500: "error",
        599: "error",
    }).forEach(([statusCode, expectedStatus]) => {
        describe(`when called with ${statusCode} as "statusCode"`, () => {
            const options = {
                ...baseOptions,
                statusCode: Number.parseInt(statusCode),
            };
            let TestError: CustomErrorClass<MetaData>;

            beforeEach(() => {
                TestError = defineError(options);
            });

            describe("the return value when called with new", () => {
                let error: CustomError<MetaData>;

                beforeEach(() => {
                    error = new TestError(baseMetaData);
                });

                describe(".status", () => {
                    it(`is "${expectedStatus}"`, () => {
                        expect(error.status).toBe(expectedStatus);
                    });
                });

                describe("the return value of .toJSON()", () => {
                    let json: JSendResponse<MetaData>;

                    beforeEach(() => {
                        json = error.toJSON();
                    });

                    describe(".status", () => {
                        it(`is "${expectedStatus}"`, () => {
                            expect(json.status).toBe(expectedStatus);
                        });
                    });
                });
            });
        });
    });

    [0, 100, 199, 300, 399, 600].forEach(statusCode => {
        describe(`when called with ${statusCode} as "statusCode"`, () => {
            const options = {
                ...baseOptions,
                statusCode,
            };

            describe("and no explicit status", () => {
                it("throws a helpful error", () => {
                    let thrownError;

                    try {
                        defineError(options);
                    } catch (error) {
                        thrownError = error;
                    }

                    expect(thrownError.message).toBe(
                        `Cannot derive status from status code ${statusCode}. When the status code is not 2xx, 4xx or 5xx, you need to specify an explicit status like "success", "fail" or "error".`,
                    );
                });
            });
        });
    });

    describe("when called with explicit code, status and statusCode", () => {
        let TestError: CustomErrorClass<MetaData>;

        beforeEach(() => {
            TestError = defineError({
                ...baseOptions,
                code: "explicit-error-code",
                status: JSendStatus.Success,
                statusCode: 600,
            });
        });

        describe("the return value when called with new", () => {
            let error: CustomError<MetaData>;

            beforeEach(() => {
                error = new TestError(baseMetaData);
            });

            describe("." + instanceKeysToSnapshot.join(", ."), () => {
                it("should match their snapshots", () => {
                    const propsToSnapshot = collectSnapshotProps(
                        error,
                        instanceKeysToSnapshot,
                    );

                    expect(propsToSnapshot).toMatchInlineSnapshot(`
Object {
  "code": "explicit-error-code",
  "data": Object {
    "some": "meta-data",
  },
  "message": "There was an error",
  "name": "TestError",
  "status": "success",
  "statusCode": 600,
}
`);
                });
            });

            describe("the return value of .toJSON()", () => {
                describe("." + jsonKeysToSnapshot.join(", ."), () => {
                    it("should match their snapshots", () => {
                        const propsToSnapshot = collectSnapshotProps(
                            error,
                            jsonKeysToSnapshot as InstanceKeys,
                        );

                        expect(propsToSnapshot).toMatchInlineSnapshot(`
Object {
  "code": "explicit-error-code",
  "data": Object {
    "some": "meta-data",
  },
  "message": "There was an error",
  "status": "success",
}
`);
                    });
                });
            });
        });
    });

    describe("when called with not enough arguments", () => {
        /* eslint-disable @typescript-eslint/ban-ts-ignore */
        it("throws an error", () => {
            expect(() =>
                // @ts-ignore
                defineError(),
            ).toThrowErrorMatchingInlineSnapshot(
                '"Missing options for defineError()"',
            );
            expect(() =>
                // @ts-ignore
                defineError({
                    message: "Error",
                }),
            ).toThrowErrorMatchingInlineSnapshot(
                '"Missing \\"name\\" property in defineError() options"',
            );
            expect(() =>
                // @ts-ignore
                defineError({
                    name: "Error",
                }),
            ).toThrowErrorMatchingInlineSnapshot(
                '"Missing \\"message\\" property in defineError() options"',
            );
        });
        /* eslint-enable @typescript-eslint/ban-ts-ignore */
    });
});
