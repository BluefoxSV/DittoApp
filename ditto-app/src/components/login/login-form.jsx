export default function LoginForm(){
    //Funcionalidad de login...
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading('');

        try{

        } catch (err) {

        } finally {

        }
    } 
    
    return (
    <section className="min-h-screen">
      <div className="min-h-screen w-full px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex min-h-screen items-center justify-center text-neutral-800 dark:text-neutral-200">
          <div className="w-full max-w-6xl overflow-hidden rounded-2xl">
            <div className="flex flex-col lg:flex-row">
              
              {/* Left column */}
              <div className="w-full lg:w-1/2">
                <div className="px-6 py-8 sm:px-8 md:px-10 lg:px-12">
                  <div className="text-center">
                    <img
                      className="mx-auto w-32 sm:w-40 md:w-48"
                      src="src/assets/icon-192.png"
                      alt="logo"
                    />
                    <h4 className="mb-8 mt-4 text-lg font-semibold sm:text-xl">
                      
                    </h4>
                  </div>

                  <form className="mx-auto w-full max-w-md" onSubmit={handleSubmit}>
                    <p className="mb-4 text-sm sm:text-base">
                      Por favor, inicia sesion con tu correo y contraseña.
                    </p>

                    <div className="mb-4">
                      <label
                        htmlFor="username"
                        className="mb-1 block text-sm font-medium"
                      >
                        Correo:
                      </label>
                      <input
                        type="text"
                        id="username"
                        placeholder="usuario@correo.com"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="mb-4">
                      <label
                        htmlFor="password"
                        className="mb-1 block text-sm font-medium"
                      >
                        Contraseña
                      </label>
                      <input
                        type="password"
                        id="password"
                        placeholder="Password"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="mb-8 text-center">
                      <button
                        type="button"
                        className="w-full rounded-lg px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                      >
                        Iniciar Session
                      </button>

                      <a
                        href="#"
                        className="mt-3 inline-block text-sm text-blue-600 hover:underline"
                      >
                        ¿Olvidaste tu contraseña?
                      </a>
                    </div>

                    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                      <p className="text-sm">¿No posees cuenta activa?</p>
                      <button
                        type="button"
                        className="rounded-lg border-2 border-[#e7eef1] px-6 py-2 text-sm font-medium text-[#e7eef1] transition hover:bg-[#12679b]"
                      >
                        Registrate
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Right column */}
              <div
                className="flex w-full items-center lg:w-1/2"
              >
                <div className="px-6 py-10 text-[#041021] sm:px-8 md:px-10 lg:px-12">
                  <h4 className="mb-4 text-lg font-semibold sm:text-xl">
                        SuperDittoApp
                  </h4>
                  <p className="text-sm leading-6 sm:text-base">
                        SuperDittoApp/Jobcrafter/Micraft es una plataforma para impulsar el empleo informal y a su vez capacitar a las personas en nuevos ambitos de trabajo. La plataforma de aprendizaje también cuenta con cursos para facilitar la educación financiera para personas sin experiencia que quieran empezar a generar ingresos.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}