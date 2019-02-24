import {
    defineError,
    CustomErrorClass,
    CustomError,
} from "../src/main";
import {JSendResponse, JSendStatus} from "../src/jSend";

describe("defineError", () => {
    type MetaData = typeof baseMetaData;
    const baseMetaData = {};
    const baseOptions = {
        name: "TestError",
        message: "There was an error",
    };

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

            describe(".stack", () => {
                it("does not contain the source location where the error has been created", () => {
                    expect(error.stack).not.toMatch(
                        /[/\\]defineError\.ts:/g,
                    );
                });
            });

            describe(".statusCode", () => {
                it("is 500", () => {
                    expect(error.statusCode).toBe(
                        500,
                    );
                });
            });
        });
    });

    describe('when called with a string as "message"', () => {
        const options = {
            ...baseOptions,
            message: "There was an error",
        };
        let TestError: CustomErrorClass<MetaData>;

        beforeEach(() => {
            TestError = defineError(baseOptions);
        });

        describe("the return value when called with new", () => {
            let error: CustomError<MetaData>;

            beforeEach(() => {
                error = new TestError(baseMetaData);
            });

            describe(".message", () => {
                it("is the static message as defined by the options", () => {
                    expect(error.message).toBe(options.message);
                });
            });
        });
    });

    describe('when called with a function as "message"', () => {
        type MetaData = typeof metaData;
        const metaData = {resource: "User", id: "123"};
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

            describe(".message", () => {
                it("matches the rendered template", () => {
                    expect(
                        error.message,
                    ).toMatchInlineSnapshot(
                        '"Resource User (123) already exists"',
                    );
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
                    error = new TestError(
                        baseMetaData,
                    );
                });

                describe(".toJSON()", () => {
                    let json: JSendResponse<
                        MetaData
                    >;

                    beforeEach(() => {
                        json = error.toJSON();
                    });

                    describe(".status", () => {
                        it(`is "${expectedStatus}"`, () => {
                            expect(
                                json.status,
                            ).toBe(
                                expectedStatus,
                            );
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

                        expect(
                            thrownError.message,
                        ).toBe(
                            `Cannot derive status from status code ${statusCode}. When the status code is not 2xx, 4xx or 5xx, you need to specify an explicit status like "success", "fail" or "error".`,
                        );
                    });
                });
            });
        });
    });

    describe("when called with no error code", () => {
        Object.entries({
            Error: "error",
            CustomError: "custom-error",
            AnotherCustomError: "another-custom-error",
            ÖtherError: "öther-error",
        }).forEach(([name, expectedCode]) => {
            let TestError: CustomErrorClass<MetaData>;

            beforeEach(() => {
                TestError = defineError({
                    ...baseOptions,
                    name,
                });
            });

            describe("the return value when called with new", () => {
                let error: CustomError<MetaData>;

                beforeEach(() => {
                    error = new TestError(
                        baseMetaData,
                    );
                });

                describe(".toJSON()", () => {
                    let json: JSendResponse<MetaData>;

                    beforeEach(() => {
                        json = error.toJSON();
                    });

                    describe(".code", () => {
                        it(`has been derived from the name (${name})`, () => {
                            expect(json.code).toBe(expectedCode);
                        });
                    });
                });
            });
        });
    });

    describe("when called with explicit status and statusCode", () => {
        let TestError: CustomErrorClass<MetaData>;

        beforeEach(() => {
            TestError = defineError({
                ...baseOptions,
                status: JSendStatus.Success,
                statusCode: 600,
            });
        });

        describe("the return value when called with new", () => {
            let error: CustomError<MetaData>;

            beforeEach(() => {
                error = new TestError(baseMetaData);
            });

            describe(".toJSON()", () => {
                let json: JSendResponse<MetaData>;

                beforeEach(() => {
                    json = error.toJSON();
                });

                // TODO: continue here
                describe(".code", () => {
                    it(`is the explicit value`, () => {
                        expect(json.code).toBe(expectedCode);
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
