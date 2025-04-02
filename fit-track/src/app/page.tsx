import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Dumbbell, Utensils, LineChart } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-indigo-800" />

        {/* Hero content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pt-16 pb-24 md:pt-20 md:pb-32 lg:flex lg:items-center lg:gap-12">
            <div className="text-center lg:text-left lg:w-1/2">
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
                <span className="block">Take control of your</span>
                <span className="block text-indigo-200">fitness journey</span>
              </h1>
              <p className="mt-6 text-xl text-indigo-100 max-w-lg mx-auto lg:mx-0">
                Track workouts, meals, and weight progress all in one place.
                FitTrack helps you reach your fitness goals with comprehensive
                tracking and insights.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/auth/register"
                  className="flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-lg text-indigo-700 bg-white hover:bg-indigo-50 transition-all duration-200 transform hover:-translate-y-1"
                >
                  Get started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="/auth/login"
                  className="flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-md text-white bg-indigo-500 bg-opacity-60 hover:bg-opacity-70 transition-all duration-200 transform hover:-translate-y-1"
                >
                  Sign in
                </Link>
              </div>
            </div>
            <div className="mt-12 lg:mt-0 lg:w-1/2">
              <div className="relative mx-auto w-full max-w-md lg:max-w-none">
                <Image
                  src="/placeholder.svg?height=600&width=600"
                  alt="Fitness tracking app dashboard"
                  width={600}
                  height={600}
                  className="rounded-xl shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500"
                  priority
                />
                <div className="absolute -bottom-4 -left-4 w-40 h-40 bg-indigo-400 rounded-full opacity-20 blur-2xl"></div>
                <div className="absolute -top-4 -right-4 w-40 h-40 bg-indigo-300 rounded-full opacity-20 blur-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features section */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-indigo-600 tracking-wide uppercase">
              Features
            </h2>
            <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
              Everything you need to succeed
            </p>
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
              Comprehensive tools to track every aspect of your fitness journey.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="group">
                <div className="relative overflow-hidden rounded-2xl shadow-lg transform transition-all duration-300 group-hover:-translate-y-2">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-indigo-700 opacity-90"></div>
                  <div className="relative p-6">
                    <div className="flex justify-center">
                      <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                        <Dumbbell className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <h3 className="mt-8 text-xl font-bold text-white text-center">
                      Workout Tracking
                    </h3>
                    <p className="mt-4 text-base text-indigo-100 text-center">
                      Log exercises, sets, reps, and weights. Monitor your
                      progress and see how you improve over time.
                    </p>
                  </div>
                  <div className="relative h-48 mt-4">
                    <Image
                      src="/placeholder.svg?height=400&width=600"
                      alt="Workout tracking interface"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="group">
                <div className="relative overflow-hidden rounded-2xl shadow-lg transform transition-all duration-300 group-hover:-translate-y-2">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-indigo-700 opacity-90"></div>
                  <div className="relative p-6">
                    <div className="flex justify-center">
                      <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                        <Utensils className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <h3 className="mt-8 text-xl font-bold text-white text-center">
                      Nutrition Management
                    </h3>
                    <p className="mt-4 text-base text-indigo-100 text-center">
                      Track meals, calories, and macronutrients. Know exactly
                      what you&apos;re putting in your body.
                    </p>
                  </div>
                  <div className="relative h-48 mt-4">
                    <Image
                      src="/placeholder.svg?height=400&width=600"
                      alt="Nutrition tracking interface"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="group">
                <div className="relative overflow-hidden rounded-2xl shadow-lg transform transition-all duration-300 group-hover:-translate-y-2">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-indigo-700 opacity-90"></div>
                  <div className="relative p-6">
                    <div className="flex justify-center">
                      <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                        <LineChart className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <h3 className="mt-8 text-xl font-bold text-white text-center">
                      Weight Monitoring
                    </h3>
                    <p className="mt-4 text-base text-indigo-100 text-center">
                      Log your weight regularly and visualize your weight loss
                      or gain journey with detailed graphs.
                    </p>
                  </div>
                  <div className="relative h-48 mt-4">
                    <Image
                      src="/placeholder.svg?height=400&width=600"
                      alt="Weight tracking graphs"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials section */}
      <div className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-indigo-600 tracking-wide uppercase">
              Testimonials
            </h2>
            <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
              Hear from our users
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Testimonial 1 */}
            <div className="bg-gray-50 rounded-2xl p-8 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center mb-6">
                <div className="h-12 w-12 rounded-full overflow-hidden mr-4">
                  <Image
                    src="/placeholder.svg?height=100&width=100"
                    alt="User avatar"
                    width={48}
                    height={48}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900">
                    Sarah J.
                  </h4>
                  <p className="text-indigo-600">Lost 15kg in 6 months</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                &quot;FitTrack has completely transformed my fitness journey.
                The ability to track everything in one place has made staying
                consistent so much easier.&quot;
              </p>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-gray-50 rounded-2xl p-8 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center mb-6">
                <div className="h-12 w-12 rounded-full overflow-hidden mr-4">
                  <Image
                    src="/placeholder.svg?height=100&width=100"
                    alt="User avatar"
                    width={48}
                    height={48}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900">
                    Michael T.
                  </h4>
                  <p className="text-indigo-600">Gained 8kg of muscle</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                &quot;The workout tracking feature is incredible. I can see my
                progress over time and it keeps me motivated to push harder each
                session.&quot;
              </p>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-gray-50 rounded-2xl p-8 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center mb-6">
                <div className="h-12 w-12 rounded-full overflow-hidden mr-4">
                  <Image
                    src="/placeholder.svg?height=100&width=100"
                    alt="User avatar"
                    width={48}
                    height={48}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900">
                    Elena K.
                  </h4>
                  <p className="text-indigo-600">Improved nutrition habits</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                &quot;The nutrition tracking has helped me understand my eating
                habits and make better food choices. I&apos;ve never felt
                healthier!&quot;
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative bg-indigo-700">
        <div className="absolute inset-0">
          <Image
            src="/placeholder.svg?height=800&width=1600"
            alt="Fitness background"
            fill
            className="object-cover mix-blend-multiply opacity-20"
          />
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Ready to start your fitness journey?
            </h2>
            <p className="mt-4 text-xl text-indigo-100 max-w-2xl mx-auto">
              Join thousands of users who have transformed their lives with
              FitTrack.
            </p>
            <div className="mt-10">
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-md shadow-lg text-indigo-700 bg-white hover:bg-indigo-50 transition-all duration-200 transform hover:-translate-y-1"
              >
                Get started for free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
